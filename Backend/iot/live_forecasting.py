from datetime import timedelta

import pandas as pd
from django.db import transaction
from django.utils import timezone

from energy.models import EnergyReading, LiveEnergyInterval

from types import SimpleNamespace

from ml.feature_builder import (
    build_energy_features,
    build_solar_features,
)

from ml.energy.inference import predict_energy
from ml.solar.inference import predict_solar

INTERVAL_MINUTES = 15
INTERVAL_HOURS = INTERVAL_MINUTES / 60
MIN_READINGS_PER_INTERVAL = 60


def aggregate_and_store_live_intervals(device_id="smart_meter_01", hours=24):
    """
    Aggregate completed simulator intervals and store them once.

    Assumptions:
    - energy_consumption represents simulated average power in kW.
    - solar_generation represents simulated solar power in kW.
    - A complete interval contains at least 60 readings.
    - Interval values are estimated energy in kWh.
    """
    now = timezone.now()
    cutoff = now - timedelta(hours=hours)

    queryset = EnergyReading.objects.filter(
        data_source="simulator",
        timestamp__gte=cutoff,
        timestamp__lte=now,
    )

    if device_id:
        queryset = queryset.filter(device_id=device_id)

    records = list(
        queryset.values(
            "device_id",
            "timestamp",
            "energy_consumption",
            "solar_generation",
        ).order_by("timestamp")
    )

    if not records:
        return {"intervals_found": 0, "intervals_saved": 0}

    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    df["interval"] = df["timestamp"].dt.floor("15min")

    aggregated = (
        df.groupby(["device_id", "interval"])
        .agg(
            average_power_kw=("energy_consumption", "mean"),
            average_solar_power_kw=("solar_generation", "mean"),
            sample_count=("timestamp", "count"),
        )
        .reset_index()
    )

    # Only process intervals that have ended.
    completed_boundary = pd.Timestamp(now).floor("15min")
    aggregated = aggregated[aggregated["interval"] < completed_boundary].copy()

    # Require at least 60 readings per interval.
    aggregated = aggregated[
        aggregated["sample_count"] >= MIN_READINGS_PER_INTERVAL
    ].copy()

    intervals_found = len(aggregated)
    intervals_saved = 0

    with transaction.atomic():
        for row in aggregated.itertuples(index=False):
            interval_timestamp = row.interval.to_pydatetime()

            _, created = LiveEnergyInterval.objects.get_or_create(
                device_id=row.device_id,
                timestamp=interval_timestamp,
                defaults={
                    "energy_consumption_kwh": (row.average_power_kw * INTERVAL_HOURS),
                    "solar_generation_kwh": (
                        row.average_solar_power_kw * INTERVAL_HOURS
                    ),
                    "sample_count": row.sample_count,
                },
            )

            if created:
                intervals_saved += 1

    return {
        "intervals_found": intervals_found,
        "intervals_saved": intervals_saved,
    }



def get_live_forecasts(device_id="smart_meter_01"):
    required_intervals = 768

    seed_intervals = list(
        LiveEnergyInterval.objects.filter(
            device_id="historical_seed"
        ).order_by("timestamp")
    )

    live_intervals = list(
        LiveEnergyInterval.objects.filter(
            device_id=device_id
        ).order_by("timestamp")
    )

    # Keep only the latest continuous live sequence.
    live_sequence = []
    for item in reversed(live_intervals):
        if live_sequence:
            gap = live_sequence[0].timestamp - item.timestamp
            if gap != timedelta(minutes=15):
                break
        live_sequence.insert(0, item)

    # A full seed is required to initialize the model.
    if len(seed_intervals) < required_intervals:
        return {
            "status": "warming_up",
            "message": "Historical seed needs 768 intervals.",
            "intervals_available": len(live_sequence),
            "seed_intervals_available": len(seed_intervals),
            "energy_forecast": None,
            "solar_forecast": None,
        }

    # Take the final 768 seed intervals as the initial context.
    context = seed_intervals[-required_intervals:]

    # Rebase timestamps to a current 15-minute timeline.
    # Preserve the original chronological spacing of the seed.
    now = timezone.now()
    current_interval = now.replace(
        minute=(now.minute // 15) * 15,
        second=0,
        microsecond=0,
    )

    rebased = []
    start_time = current_interval - timedelta(
        minutes=15 * (required_intervals - 1)
    )

    for index, item in enumerate(context):
        rebased.append(
            SimpleNamespace(
                timestamp=start_time + timedelta(minutes=15 * index),
                energy_consumption=item.energy_consumption_kwh,
                solar_generation=item.solar_generation_kwh,
            )
        )

    # Replace the tail of the historical context with recent live values.
    # Limit replacement to avoid exceeding the model's 768-row context.
    live_to_apply = live_sequence[-required_intervals:]
    live_count = len(live_to_apply)

    for index, item in enumerate(live_to_apply):
        target_index = required_intervals - live_count + index
        rebased[target_index] = SimpleNamespace(
            timestamp=rebased[target_index].timestamp,
            energy_consumption=item.energy_consumption_kwh,
            solar_generation=item.solar_generation_kwh,
        )

    energy_features = build_energy_features(rebased)
    solar_features = build_solar_features(rebased)

    if len(energy_features) < 96 or solar_features.empty:
        return {
            "status": "warming_up",
            "message": "Not enough usable features for forecasting.",
            "intervals_available": len(live_sequence),
            "seed_intervals_available": len(seed_intervals),
            "energy_forecast": None,
            "solar_forecast": None,
        }

    energy_prediction = predict_energy(energy_features.tail(96))
    solar_prediction = predict_solar(solar_features.tail(1))

    source = "seeded_live" if live_count else "historical_seed"

    return {
        "status": "ready",
        "source": source,
        "intervals_available": len(live_sequence),
        "live_intervals_used": live_count,
        "seed_intervals_available": len(seed_intervals),
        "energy_forecast": energy_prediction,
        "solar_forecast": solar_prediction,
        "message": (
            "Forecast uses historical context and recent simulator intervals."
            if live_count
            else "Forecast uses historical seed; no completed simulator intervals are available yet."
        ),
    }
