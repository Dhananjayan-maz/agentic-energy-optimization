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
    

class DataQualityEvent(models.Model):
    EVENT_TYPES = [
        ("rejected", "Rejected MQTT message"),
        ("duplicate", "Duplicate MQTT message"),
    ]

    device_id = models.CharField(max_length=100, blank=True, default="")
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    reason = models.CharField(max_length=255)
    details = models.TextField(blank=True, default="")
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-received_at"]

    def __str__(self):
        return f"{self.event_type}: {self.reason} ({self.received_at})"


class LiveEnergyInterval(models.Model):
    """
    Aggregated 15-minute interval derived from simulator readings.
    Values represent estimated interval energy in kWh.
    """

    device_id = models.CharField(max_length=100)
    timestamp = models.DateTimeField()
    energy_consumption_kwh = models.FloatField()
    solar_generation_kwh = models.FloatField()
    sample_count = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]
        constraints = [
            models.UniqueConstraint(
                fields=["device_id", "timestamp"],
                name="unique_live_energy_interval",
            )
        ]

    def __str__(self):
        return (
            f"{self.device_id} - {self.timestamp} "
            f"- {self.energy_consumption_kwh} kWh"
        )
