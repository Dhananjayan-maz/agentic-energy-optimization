
import json
import random
import time
import math

from datetime import datetime, timezone

import paho.mqtt.client as mqtt


BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "energy/readings"
DEVICE_ID = "smart_meter_01"

PUBLISH_INTERVAL = 15
RECONNECT_RETRY_SECONDS = 5

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="energy-iot-simulator",
)

# Retry automatically with increasing delays after disconnection.
client.reconnect_delay_set(min_delay=1, max_delay=30)


def on_connect(client, userdata, flags, reason_code, properties):
    if not reason_code.is_failure:
        print(f"Connected to MQTT broker at {BROKER}:{PORT}")
    else:
        print(f"MQTT connection failed: {reason_code}")


def on_disconnect(
    client, userdata, disconnect_flags, reason_code, properties
):
    print(f"MQTT disconnected: {reason_code}. Reconnecting...")


client.on_connect = on_connect
client.on_disconnect = on_disconnect


def generate_reading():
    now = datetime.now(timezone.utc)
    hour = now.hour + now.minute / 60

    energy = max(
        1.0,
        5.0 + 2.0 * (1 - abs(hour - 14) / 14)
        + random.uniform(-0.5, 0.5),
    )

    daylight = max(
        0.0,
        math.sin((hour - 6) * math.pi / 12),
    )

    solar = max(
        0.0,
        4.0 * daylight + random.uniform(-0.15, 0.15),
    )

    return {
        "device_id": DEVICE_ID,
        "timestamp": now.isoformat(),
        "energy_consumption": round(energy, 3),
        "solar_generation": round(solar, 3),
        "temperature": round(random.uniform(27, 34), 1),
        "humidity": round(random.uniform(45, 75), 1),
        "irradiance": round(800 * daylight, 1),
    }


def main():
    print("Starting IoT energy simulator...")
    print(f"Broker: {BROKER}:{PORT}")
    print(f"Topic: {TOPIC}")

    # Retry the initial connection if Mosquitto is unavailable.
    while True:
        try:
            client.connect(BROKER, PORT, keepalive=60)
            break
        except (OSError, mqtt.MQTTException) as exc:
            print(
                f"Cannot connect to MQTT broker: {exc}. "
                f"Retrying in {RECONNECT_RETRY_SECONDS} seconds..."
            )
            time.sleep(RECONNECT_RETRY_SECONDS)

    client.loop_start()

    try:
        while True:
            if not client.is_connected():
                print("Broker connection unavailable; skipping this reading.")
            else:
                reading = generate_reading()

                try:
                    result = client.publish(
                        TOPIC,
                        json.dumps(reading),
                        qos=1,
                    )

                    if result.rc != mqtt.MQTT_ERR_SUCCESS:
                        print(
                            f"Publish could not start: "
                            f"{mqtt.error_string(result.rc)}"
                        )
                    else:
                        result.wait_for_publish(timeout=10)

                        if result.is_published():
                            print(
                                f"Published: {reading}"
                            )
                        else:
                            print(
                                "Publish not confirmed yet; "
                                "the next iteration will retry with a new reading."
                            )

                except (RuntimeError, ValueError, OSError) as exc:
                    print(f"Publish failed: {exc}. Simulator will continue.")

            time.sleep(PUBLISH_INTERVAL)

    except KeyboardInterrupt:
        print("\nStopping IoT simulator...")

    finally:
        client.disconnect()
        client.loop_stop()
        print("IoT simulator stopped.")


if __name__ == "__main__":
    main()
