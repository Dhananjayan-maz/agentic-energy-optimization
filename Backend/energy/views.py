import os

import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from datetime import timedelta
from django.utils import timezone

from .models import EnergyReading
from .serializers import EnergyReadingSerializer

from ml.energy.inference import predict_energy
from ml.solar.inference import predict_solar

from ml.feature_builder import build_energy_features, build_solar_features


class EnergyReadingViewSet(viewsets.ModelViewSet):
    queryset = EnergyReading.objects.all().order_by("-timestamp")
    serializer_class = EnergyReadingSerializer


# --------------------------------------------------
# Energy Forecast API
# --------------------------------------------------


@api_view(["POST"])
def energy_forecast(request):
    try:
        # --------------------------------------------------
        # Get enough historical readings from Django DB
        # --------------------------------------------------
        readings = list(
            EnergyReading.objects.filter(data_source="historical").order_by(
                "-timestamp"
            )[:768]
        )

        if len(readings) < 672 + 96:
            return Response(
                {
                    "error": "Not enough historical readings.",
                    "required": 768,
                    "available": len(readings),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Reverse so readings are chronological
        readings.reverse()

        # --------------------------------------------------
        # Build ML features
        # --------------------------------------------------
        features = build_energy_features(readings)

        # We need the latest 96 feature rows for the LSTM
        input_data = features.tail(96).to_dict("records")

        # --------------------------------------------------
        # Generate prediction
        # --------------------------------------------------
        prediction = predict_energy(input_data)

        # Latest database reading
        latest_reading = readings[-1]

        return Response(
            {
                "forecast_type": "energy",
                "latest_timestamp": latest_reading.timestamp,
                "latest_energy_kwh": latest_reading.energy_consumption,
                "predicted_energy_kwh": round(prediction, 4),
                "input_time_steps": len(input_data),
            }
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --------------------------------------------------
# Solar Forecast API
# --------------------------------------------------


@api_view(["POST"])
def solar_forecast(request):
    try:
        readings = list(
            EnergyReading.objects.filter(data_source="historical").order_by(
                "-timestamp"
            )[: 672 + 1]
        )

        if len(readings) < 672 + 1:
            return Response(
                {
                    "error": "Not enough historical readings.",
                    "required": 673,
                    "available": len(readings),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        readings.reverse()

        features = build_solar_features(readings)

        input_data = features.tail(1).to_dict("records")

        prediction = predict_solar(input_data)

        latest_reading = readings[-1]

        return Response(
            {
                "forecast_type": "solar",
                "latest_timestamp": latest_reading.timestamp,
                "latest_solar_kwh": latest_reading.solar_generation,
                "predicted_solar_kwh": round(prediction, 4),
                "input_time_steps": len(input_data),
            }
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def dashboard_data(request):
    try:
        latest_reading = (
            EnergyReading.objects.filter(data_source="historical")
            .order_by("-timestamp")
            .first()
        )
        if latest_reading is None:
            return Response(
                {"error": "No energy readings available."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Energy forecast
        energy_readings = list(EnergyReading.objects.order_by("-timestamp")[:768])

        if len(energy_readings) < 768:
            return Response(
                {
                    "error": "Not enough readings for energy forecast.",
                    "available": len(energy_readings),
                    "required": 768,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        energy_readings.reverse()

        energy_features = build_energy_features(energy_readings)
        energy_input = energy_features.tail(96).to_dict("records")
        energy_prediction = predict_energy(energy_input)

        # Solar forecast
        solar_readings = list(EnergyReading.objects.order_by("-timestamp")[:673])

        if len(solar_readings) < 673:
            return Response(
                {
                    "error": "Not enough readings for solar forecast.",
                    "available": len(solar_readings),
                    "required": 673,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        solar_readings.reverse()

        solar_features = build_solar_features(solar_readings)
        solar_input = solar_features.tail(1).to_dict("records")
        solar_prediction = predict_solar(solar_input)

        return Response(
            {
                "latest": {
                    "timestamp": latest_reading.timestamp,
                    "energy_consumption_kwh": latest_reading.energy_consumption,
                    "solar_generation_kwh": latest_reading.solar_generation,
                },
                "forecast": {
                    "energy_kwh": round(energy_prediction, 4),
                    "solar_kwh": round(solar_prediction, 4),
                },
            }
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def energy_history(request):
    readings = EnergyReading.objects.filter(data_source="historical").order_by(
        "-timestamp"
    )[:96]
    
    readings = list(readings)
    readings.reverse()

    data = []

    for reading in readings:
        data.append(
            {
                "timestamp": reading.timestamp,
                "energy_consumption_kwh": reading.energy_consumption,
                "solar_generation_kwh": reading.solar_generation,
            }
        )

    return Response(data)



@api_view(["GET"])
def live_monitoring(request):
    latest_reading = (
        EnergyReading.objects
        .filter(data_source="simulator")
        .order_by("-timestamp")
        .first()
    )

    if latest_reading is None:
        return Response(
            {
                "status": "offline",
                "message": "No simulator readings available.",
                "latest_reading": None,
            },
            status=status.HTTP_200_OK,
        )

    now = timezone.now()
    age_seconds = max(
        0,
        (now - latest_reading.timestamp).total_seconds()
    )
    print(now)
    print(age_seconds)

    freshness_threshold_seconds = 45

    if age_seconds <= freshness_threshold_seconds:
        device_status = "online"
    else:
        device_status = "stale"

    return Response({
        "status": device_status,
        "device_id": latest_reading.device_id,
        "timestamp": latest_reading.timestamp,
        "age_seconds": round(age_seconds, 1),
        "freshness_threshold_seconds": freshness_threshold_seconds,
        "energy_consumption_kwh": latest_reading.energy_consumption,
        "solar_generation_kwh": latest_reading.solar_generation,
        "temperature": latest_reading.temperature,
        "humidity": latest_reading.humidity,
        "irradiance": latest_reading.irradiance,
        "data_source": latest_reading.data_source,
    })