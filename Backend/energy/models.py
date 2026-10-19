from django.db import models


class EnergyReading(models.Model):
    timestamp = models.DateTimeField()

    energy_consumption = models.FloatField()
    solar_generation = models.FloatField()

    temperature = models.FloatField()
    humidity = models.FloatField()
    irradiance = models.FloatField()

    grid_energy = models.FloatField()

    carbon_emission = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    
    device_id = models.CharField(max_length=100, default="historical_dataset",)

    data_source = models.CharField(max_length=20, default="historical",)
    
    def __str__(self):
        return f"{self.timestamp} - {self.energy_consumption} kWh"