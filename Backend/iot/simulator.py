
import json
import random
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "energy/readings"
DEVICE_ID = "smart_meter_01"

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="energy-iot-simulator",
)


def generate_reading():
    now = datetime.now(timezone.utc)
    hour = now.hour + now.minute / 60

    # Illustrative synthetic readings, not real sensor measurements.
    energy = max(
        1.0,
        5.0 + 2.0 * (1 - abs(hour - 14) / 14)
        + random.uniform(-0.5, 0.5),
    )

    # Simple daylight-shaped solar simulation.
    daylight = max(0.0, __import__("math").sin(
        (hour - 6) * 3.14159 / 12
    ))
    solar = max(0.0, 4.0 * daylight + random.uniform(-0.15, 0.15))

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
    print(f"Connecting to MQTT broker {BROKER}:{PORT}...")
    client.connect(BROKER, PORT, keepalive=60)
    client.loop_start()

    try:
        while True:
            reading = generate_reading()
            result = client.publish(
                TOPIC,
                json.dumps(reading),
                qos=1,
            )

            result.wait_for_publish()
            print(f"Published to {TOPIC}: {json.dumps(reading)}")
            time.sleep(15)

    except KeyboardInterrupt:
        print("\nSimulator stopped.")

    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
