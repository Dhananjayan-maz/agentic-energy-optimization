import os
import pandas as pd
import numpy as np

from inference import predict_solar


# Resolve project root
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

TEST_DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "solar_forecasting",
    "solar_test.csv"
)


# Load test data
df = pd.read_csv(TEST_DATA_PATH)

if df.empty:
    raise ValueError("Solar test dataset is empty.")

# Select representative nighttime and daytime samples
night_rows = df[df["hour"].between(0, 5)]
day_rows = df[df["hour"].between(10, 14)]

if night_rows.empty:
    raise ValueError("No nighttime samples found in solar_test.csv.")

if day_rows.empty:
    raise ValueError("No daytime samples found in solar_test.csv.")

night_sample = night_rows.iloc[[0]].to_dict("records")
day_sample = day_rows.iloc[[0]].to_dict("records")

# Run inference
night_prediction = predict_solar(night_sample)
day_prediction = predict_solar(day_sample)

# Validate predictions
predictions = [night_prediction, day_prediction]

for prediction in predictions:
    if not np.isfinite(prediction):
        raise ValueError("Model returned a non-finite prediction.")

    if prediction < 0:
        raise ValueError(
            f"Model returned negative solar generation: {prediction}"
        )

print("\n--------------------------------")
print("SOLAR FORECAST INFERENCE TEST")
print("--------------------------------")

print("\nNighttime sample")
print(f"Timestamp        : {night_sample[0]['timestamp']}")
print(f"Actual solar     : {night_sample[0]['target_solar']:.4f} kWh")
print(f"Predicted solar  : {night_prediction:.4f} kWh")

print("\nDaytime sample")
print(f"Timestamp        : {day_sample[0]['timestamp']}")
print(f"Actual solar     : {day_sample[0]['target_solar']:.4f} kWh")
print(f"Predicted solar  : {day_prediction:.4f} kWh")

print("\n--------------------------------")
print("Inference completed successfully.")
print("Both predictions are finite and non-negative.")
print("--------------------------------")
