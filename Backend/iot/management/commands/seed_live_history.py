
import pandas as pd

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from energy.models import LiveEnergyInterval


class Command(BaseCommand):
    help = "Seed live forecasting context from historical 15-minute data."

    def handle(self, *args, **options):
        csv_path = (
            "data/processed_data/"
            "phase1_industrial1_timeseries.csv"
        )
        device_id = "historical_seed"
        required_intervals = 768

        try:
            df = pd.read_csv(csv_path, parse_dates=["timestamp"])
        except Exception as exc:
            raise CommandError(
                f"Could not read historical dataset: {exc}"
            ) from exc

        required_columns = {
            "timestamp",
            "energy_consumption_kwh",
            "solar_generation_kwh",
        }
        if not required_columns.issubset(df.columns):
            raise CommandError(
                "Historical CSV is missing required columns."
            )

        df = df.sort_values("timestamp").reset_index(drop=True)

        # Select the latest 768 rows and verify 15-minute continuity.
        seed = df.tail(required_intervals).copy()

        if len(seed) != required_intervals:
            raise CommandError(
                f"Expected {required_intervals} rows; found {len(seed)}."
            )

        timestamps = pd.to_datetime(seed["timestamp"], utc=True)
        differences = timestamps.diff().dropna()

        if not differences.eq(pd.Timedelta(minutes=15)).all():
            raise CommandError(
                "Selected historical rows are not consecutive "
                "15-minute intervals."
            )

        created_count = 0

        with transaction.atomic():
            for row in seed.itertuples(index=False):
                _, created = LiveEnergyInterval.objects.get_or_create(
                    device_id=device_id,
                    timestamp=row.timestamp.to_pydatetime(),
                    defaults={
                        "energy_consumption_kwh": float(
                            row.energy_consumption_kwh
                        ),
                        "solar_generation_kwh": float(
                            row.solar_generation_kwh
                        ),
                        "sample_count": 0,
                    },
                )
                if created:
                    created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Historical seed complete. "
                f"Intervals selected: {len(seed)}, "
                f"new intervals saved: {created_count}, "
                f"device: {device_id}"
            )
        )
