from rest_framework import viewsets
from .models import *
from .serializers import EnergyReadingSerializer


class EnergyReadingViewSet(viewsets.ModelViewSet):
    queryset = EnergyReading.objects.all().order_by('-timestamp')
    serializer_class = EnergyReadingSerializer