import os

import pandas as pd
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import EnergyReading
from .serializers import EnergyReadingSerializer

from ml.energy.inference import predict_energy
from ml.solar.inference import predict_solar


class EnergyReadingViewSet(viewsets.ModelViewSet):
    queryset = EnergyReading.objects.all().order_by('-timestamp')
    serializer_class = EnergyReadingSerializer


# --------------------------------------------------
# Energy Forecast API
# --------------------------------------------------

@api_view(['POST'])
def energy_forecast(request):
    try:
        base_dir = os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )

        data_path = os.path.join(
            base_dir,
            "data",
            "energy_forecasting",
            "energy_test.csv"
        )

        df = pd.read_csv(data_path)

        # LSTM requires the latest 96 rows
        input_data = df.tail(96).to_dict("records")

        prediction = predict_energy(input_data)

        return Response({
            "forecast_type": "energy",
            "predicted_energy_kwh": round(prediction, 4),
            "input_time_steps": len(input_data)
        })

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# --------------------------------------------------
# Solar Forecast API
# --------------------------------------------------

@api_view(['POST'])
def solar_forecast(request):
    try:
        base_dir = os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )

        data_path = os.path.join(
            base_dir,
            "data",
            "solar_forecasting",
            "solar_test.csv"
        )

        df = pd.read_csv(data_path)

        # XGBoost requires one feature row
        input_data = df.tail(1).to_dict("records")

        prediction = predict_solar(input_data)

        return Response({
            "forecast_type": "solar",
            "predicted_solar_kwh": round(prediction, 4),
            "input_rows": len(input_data)
        })

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )