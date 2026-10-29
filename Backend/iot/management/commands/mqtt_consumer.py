import json
import logging
import math
from datetime import datetime, timedelta, timezone

import paho.mqtt.client as mqtt
from django.core.management.base import BaseCommand
from django.db import close_old_connections
from django.utils import timezone as django_timezone

from energy.models import DataQualityEvent, EnergyReading

logger = logging.getLogger(__name__)

BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "energy/readings"


class Command(BaseCommand):
    help = "Subscribe to MQTT sensor readings and store them in Django"

    def record_quality_event(self, event_type, reason, device_id="", details=""):
        try:
            DataQualityEvent.objects.create(
                event_type=event_type,
                reason=str(reason)[:255],
                device_id=str(device_id or "")[:100],
                details=str(details),
            )
        except Exception:
            logger.exception("Failed to record data-quality event")

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
            
            payload = None

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

                timestamp_value = payload["timestamp"]

                if not isinstance(timestamp_value, str):
                    raise ValueError("Timestamp must be a string")
                
                try:
                    timestamp = datetime.fromisoformat(
                        timestamp_value.replace("Z", "+00:00")
                    )
                except ValueError:
                    raise ValueError("Timestamp must be a valid ISO 8601 datetime")
                
                if timestamp.tzinfo is None or timestamp.utcoffset() is None:
                    raise ValueError("Timestamp must include a timezone")
                
                timestamp = timestamp.astimezone(timezone.utc)

                if timestamp.tzinfo is None:
                    raise ValueError("Timestamp must include a timezone")

                timestamp = timestamp.astimezone(timezone.utc)

                now = datetime.now(timezone.utc)
                allowed_delay = timedelta(minutes=5)
                allowed_future_skew = timedelta(seconds=30)

                
                if timestamp < now - allowed_delay:
                    delay_seconds = (now - timestamp).total_seconds()
                    self.record_quality_event(
                        event_type="rejected",
                        reason="Delayed MQTT timestamp",
                        device_id=str(payload.get("device_id", "")),
                        details=f"Timestamp: {timestamp}; delay: {delay_seconds:.1f} seconds",
                    )
                    self.stderr.write(
                        f"Rejected delayed MQTT message: timestamp={timestamp}, "
                        f"delay={delay_seconds:.1f} seconds"
                    )
                    return
                
                if timestamp > now + allowed_future_skew:
                    ahead_seconds = (timestamp - now).total_seconds()
                    self.record_quality_event(
                        event_type="rejected",
                        reason="Future MQTT timestamp",
                        device_id=str(payload.get("device_id", "")),
                        details=f"Timestamp: {timestamp}; ahead by: {ahead_seconds:.1f} seconds",
                    )
                    self.stderr.write(
                        f"Rejected future MQTT message: timestamp={timestamp}, "
                        f"ahead_by={ahead_seconds:.1f} seconds"
                    )
                    return
                

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
                    self.record_quality_event(
                        event_type="duplicate",
                        reason="Duplicate MQTT reading",
                        device_id=device_id,
                        details=f"Duplicate timestamp: {timestamp}",
                    )
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
                
                device_id = ""
                if isinstance(payload, dict):
                    device_id = str(payload.get("device_id", "") or "").strip()
                
                self.record_quality_event(
                    event_type="rejected",
                    reason=str(exc),
                    device_id=device_id,
                    details=f"Topic: {message.topic}",
                )
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
