from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    EnergyReadingViewSet,
    energy_forecast,
    solar_forecast,
)


router = DefaultRouter()

router.register(
    r'energy-readings',
    EnergyReadingViewSet,
    basename='energy-reading'
)


urlpatterns = router.urls + [
    path(
        'forecast/energy/',
        energy_forecast,
        name='energy-forecast'
    ),

    path(
        'forecast/solar/',
        solar_forecast,
        name='solar-forecast'
    ),
]