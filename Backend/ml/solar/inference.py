import os
import joblib
import pandas as pd


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "saved_models",
    "solar",
    "xgboost.pkl"
)


# --------------------------------------------------
# Load model
# --------------------------------------------------

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# Feature order used during training
# --------------------------------------------------

FEATURE_COLUMNS = [
    "hour",
    "minute",
    "hour_decimal",
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
# Solar prediction function
# --------------------------------------------------

def predict_solar(input_data):
    """
    input_data should contain one row with
    the features required by the XGBoost model.
    """

    df = pd.DataFrame(input_data)

    missing_columns = [
        col for col in FEATURE_COLUMNS
        if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    X = df[FEATURE_COLUMNS]

    prediction = model.predict(X)

    prediction = max(0.0, float(prediction[0]))
    
    return prediction