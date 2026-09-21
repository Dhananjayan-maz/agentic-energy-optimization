from rest_framework.routers import DefaultRouter
from .views import EnergyReadingViewSet

router = DefaultRouter()

router.register(
    r'energy-readings',
    EnergyReadingViewSet,
    basename='energy-reading'
)

urlpatterns = router.urls