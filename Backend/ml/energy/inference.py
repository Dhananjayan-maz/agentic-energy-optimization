import os
import joblib
import numpy as np
import pandas as pd
from keras.models import load_model


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "saved_models",
    "energy",
    "lstm_model.keras"
)

FEATURE_SCALER_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "saved_models",
    "energy",
    "lstm_feature_scaler.pkl"
)

TARGET_SCALER_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "saved_models",
    "energy",
    "lstm_target_scaler.pkl"
)


# --------------------------------------------------
# Load model and scalers
# --------------------------------------------------

model = load_model(MODEL_PATH)

feature_scaler = joblib.load(FEATURE_SCALER_PATH)

target_scaler = joblib.load(TARGET_SCALER_PATH)

# --------------------------------------------------
# Feature order used during training
# --------------------------------------------------

FEATURE_COLUMNS = [
    "hour",
    "day_of_week",
    "month",
    "is_weekend",
    "lag_1",
    "lag_4",
    "lag_96",
    "lag_672",
    "rolling_mean_4",
    "rolling_mean_96",
    "rolling_std_96",
]


# --------------------------------------------------
# Energy prediction function
# --------------------------------------------------

def predict_energy(input_data):
    """
    input_data must contain the previous 96 time steps
    with the same features used during LSTM training.
    """

    df = pd.DataFrame(input_data)

    # Check required columns
    missing_columns = [
        col for col in FEATURE_COLUMNS
        if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    # Keep only training features in correct order
    X = df[FEATURE_COLUMNS].values

    # LSTM requires exactly 96 time steps
    if len(X) != 96:
        raise ValueError(
            f"Expected 96 time steps, received {len(X)}"
        )

    # Scale features
    X_scaled = feature_scaler.transform(X)

    # Reshape:
    # (96, 12) → (1, 96, 12)
    X_scaled = np.expand_dims(X_scaled, axis=0)

    # Predict
    prediction_scaled = model.predict(
        X_scaled,
        verbose=0
    )

    # Convert prediction back to kWh
    prediction = target_scaler.inverse_transform(
        prediction_scaled
    )

    return float(prediction[0][0])