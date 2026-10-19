from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import *

router = DefaultRouter()

router.register(r"energy-readings", EnergyReadingViewSet, basename="energy-reading")


urlpatterns = router.urls + [
    path("forecast/energy/", energy_forecast, name="energy-forecast"),
    path("forecast/solar/", solar_forecast, name="solar-forecast"),
    path('dashboard/', dashboard_data, name='dashboard-data'),
    path('history/', energy_history, name='energy-history'),
    path('live/', live_monitoring, name='live-monitoring'),
]
