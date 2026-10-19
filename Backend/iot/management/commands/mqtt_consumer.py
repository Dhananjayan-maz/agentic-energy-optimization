import json
import logging
import math
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
from django.core.management.base import BaseCommand
from django.db import close_old_connections
from django.utils import timezone as django_timezone

from energy.models import EnergyReading

logger = logging.getLogger(__name__)

BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "energy/readings"


class Command(BaseCommand):
    help = "Subscribe to MQTT sensor readings and store them in Django"

    def handle(self, *args, **options):
        client = mqtt.Client(
            mqtt.CallbackAPIVersion.VERSION2,
            client_id="django-energy-consumer",
        )

        def on_connect(client, userdata, flags, reason_code, properties):
            if reason_code.is_failure:
                self.stderr.write(f"MQTT connection failed: {reason_code}")
                return

            self.stdout.write(self.style.SUCCESS("Connected to MQTT broker"))
            client.subscribe(TOPIC, qos=1)
            self.stdout.write(f"Subscribed to {TOPIC}")

        def on_message(client, userdata, message):
            close_old_connections()

            try:
                payload = json.loads(message.payload.decode("utf-8"))

                required = [
                    "device_id",
                    "timestamp",
                    "energy_consumption",
                    "solar_generation",
                    "temperature",
                    "humidity",
                    "irradiance",
                ]

                if not isinstance(payload, dict):
                    raise ValueError("Message must be a JSON object")

                missing = [key for key in required if key not in payload]
                if missing:
                    raise ValueError(f"Missing fields: {missing}")

                timestamp = datetime.fromisoformat(
                    payload["timestamp"].replace("Z", "+00:00")
                )

                if timestamp.tzinfo is None:
                    raise ValueError("Timestamp must include a timezone")

                timestamp = timestamp.astimezone(timezone.utc)

                values = {}

                for key in required[2:]:
                    value = float(payload[key])

                    if not math.isfinite(value) or value < 0:
                        raise ValueError(f"{key} must be a finite, non-negative number")

                    values[key] = value
                if values["humidity"] > 100:
                    raise ValueError("Humidity must be between 0 and 100")

                if values["irradiance"] > 1500:
                    raise ValueError("Irradiance exceeds the configured limit")

                device_id = str(payload["device_id"]).strip()

                if not device_id:
                    raise ValueError("device_id cannot be empty")

                if EnergyReading.objects.filter(
                    device_id=device_id,
                    timestamp=timestamp,
                    data_source="simulator",
                ).exists():
                    self.stdout.write(
                        f"Skipped duplicate reading from {device_id} at {timestamp}"
                    )
                    return

                reading = EnergyReading.objects.create(
                    timestamp=timestamp,
                    energy_consumption=values["energy_consumption"],
                    solar_generation=values["solar_generation"],
                    temperature=values["temperature"],
                    humidity=values["humidity"],
                    irradiance=values["irradiance"],
                    grid_energy=values["energy_consumption"],
                    carbon_emission=None,
                    device_id=device_id,
                    data_source="simulator",
                )

                self.stdout.write(
                    self.style.SUCCESS(f"Saved reading #{reading.pk} at {timestamp}")
                )

            except (ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
                self.stderr.write(f"Rejected MQTT message: {exc}")
            except Exception:
                logger.exception("Failed to process MQTT message")
            finally:
                close_old_connections()

        client.on_connect = on_connect
        client.on_message = on_message

        self.stdout.write(f"Connecting to {BROKER}:{PORT}...")
        client.connect(BROKER, PORT, keepalive=60)

        try:
            client.loop_forever()
        except KeyboardInterrupt:
            self.stdout.write("Stopping MQTT consumer...")
        finally:
            client.disconnect()
