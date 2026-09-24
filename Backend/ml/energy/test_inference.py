import os
import pandas as pd

from inference import predict_energy


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
    "energy_forecasting",
    "energy_test.csv"
)


# Load test data
df = pd.read_csv(TEST_DATA_PATH)

# Take the first 96 time steps
input_data = df.iloc[:96].to_dict("records")


# Generate prediction
prediction = predict_energy(input_data)


print("\n------------------------------")
print("ENERGY FORECAST TEST")
print("------------------------------")

print(f"Input time steps : {len(input_data)}")
print(f"Predicted energy : {prediction:.4f} kWh")

print("------------------------------")
print("Inference successful!")