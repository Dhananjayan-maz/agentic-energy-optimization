import os
import pandas as pd

from inference import predict_solar


# Path to test dataset
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

# Use one row for prediction
input_data = df.iloc[[0]].to_dict("records")


# Generate prediction
prediction = predict_solar(input_data)


print("\n------------------------------")
print("SOLAR FORECAST TEST")
print("------------------------------")

print(f"Input rows       : {len(input_data)}")
print(f"Predicted solar  : {prediction:.4f} kWh")

print("------------------------------")
print("Inference successful!")