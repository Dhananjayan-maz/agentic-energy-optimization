import os

import numpy as np
import pandas as pd
import joblib

from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    mean_absolute_percentage_error,
    r2_score
)

from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout, Input
from keras.callbacks import EarlyStopping


# ============================================================
# Configuration
# ============================================================

TRAIN_PATH = "../../data/solar_forecasting/solar_train.csv"
TEST_PATH = "../../data/solar_forecasting/solar_test.csv"

MODEL_PATH = "../saved_models/solar/lstm_model.keras"

FEATURE_SCALER_PATH = "../saved_models/solar/lstm_feature_scaler.pkl"
TARGET_SCALER_PATH = "../saved_models/solar/lstm_target_scaler.pkl"

PREDICTION_PATH = "../../data/solar_forecasting/lstm_predictions.csv"

SEQUENCE_LENGTH = 96       # Previous 24 hours
EPOCHS = 30
BATCH_SIZE = 64


# ============================================================
# Load data
# ============================================================

print("Loading solar training and testing data...")

train_df = pd.read_csv(TRAIN_PATH)
test_df = pd.read_csv(TEST_PATH)

train_df["timestamp"] = pd.to_datetime(train_df["timestamp"])
test_df["timestamp"] = pd.to_datetime(test_df["timestamp"])

print(f"Training rows: {len(train_df)}")
print(f"Testing rows : {len(test_df)}")


# ============================================================
# Features and target
# ============================================================

features = [
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
    "rolling_std_96"
]

target = "target_solar"


# ============================================================
# Prepare data
# ============================================================

X_train_raw = train_df[features].values
y_train_raw = train_df[[target]].values

X_test_raw = test_df[features].values
y_test_raw = test_df[[target]].values


# ============================================================
# Scale features and target
# ============================================================

print("\nScaling data...")

feature_scaler = MinMaxScaler()
target_scaler = MinMaxScaler()

X_train_scaled = feature_scaler.fit_transform(X_train_raw)
X_test_scaled = feature_scaler.transform(X_test_raw)

y_train_scaled = target_scaler.fit_transform(y_train_raw)
y_test_scaled = target_scaler.transform(y_test_raw)


# ============================================================
# Create sequences
# ============================================================

def create_sequences(X, y, sequence_length):
    X_sequences = []
    y_sequences = []

    for i in range(sequence_length, len(X)):
        X_sequences.append(
            X[i - sequence_length:i]
        )

        y_sequences.append(
            y[i]
        )

    return np.array(X_sequences), np.array(y_sequences)


print("\nCreating LSTM sequences...")

X_train, y_train = create_sequences(
    X_train_scaled,
    y_train_scaled,
    SEQUENCE_LENGTH
)

X_test, y_test = create_sequences(
    X_test_scaled,
    y_test_scaled,
    SEQUENCE_LENGTH
)

print(f"X_train shape: {X_train.shape}")
print(f"y_train shape: {y_train.shape}")
print(f"X_test shape : {X_test.shape}")
print(f"y_test shape : {y_test.shape}")


# ============================================================
# Build LSTM model
# ============================================================

print("\nBuilding Solar LSTM model...")

model = Sequential([
    Input(
        shape=(
            X_train.shape[1],
            X_train.shape[2]
        )
    ),

    LSTM(
        64,
        return_sequences=True
    ),

    Dropout(0.2),

    LSTM(32),

    Dropout(0.2),

    Dense(
        16,
        activation="relu"
    ),

    Dense(1)
])


model.compile(
    optimizer="adam",
    loss="mse"
)


model.summary()


# ============================================================
# Early stopping
# ============================================================

early_stopping = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)


# ============================================================
# Train
# ============================================================

print("\nTraining Solar LSTM model...")

history = model.fit(
    X_train,
    y_train,
    validation_split=0.1,
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=[early_stopping],
    verbose=1
)

print("\nTraining completed.")


# ============================================================
# Prediction
# ============================================================

print("\nGenerating predictions...")

y_pred_scaled = model.predict(
    X_test,
    verbose=0
)


# Convert predictions back to kWh

y_pred = target_scaler.inverse_transform(
    y_pred_scaled
).flatten()

y_test_actual = target_scaler.inverse_transform(
    y_test
).flatten()


# ============================================================
# Evaluation
# ============================================================

mae = mean_absolute_error(
    y_test_actual,
    y_pred
)

rmse = np.sqrt(
    mean_squared_error(
        y_test_actual,
        y_pred
    )
)

# Solar-specific MAPE:
# Ignore zero / near-zero actual solar generation.

mape_mask = y_test_actual > 0.01

mape = mean_absolute_percentage_error(
    y_test_actual[mape_mask],
    y_pred[mape_mask]
) * 100

r2 = r2_score(
    y_test_actual,
    y_pred
)


# ============================================================
# Results
# ============================================================

print("\nSolar LSTM Results")
print("----------------------------")

print(f"MAE  : {mae:.4f} kWh")
print(f"RMSE : {rmse:.4f} kWh")
print(f"MAPE : {mape:.2f}%")
print(f"R²   : {r2:.4f}")


# ============================================================
# Save model
# ============================================================

os.makedirs(
    os.path.dirname(MODEL_PATH),
    exist_ok=True
)

model.save(MODEL_PATH)

print(
    f"\nModel saved to: {MODEL_PATH}"
)


# ============================================================
# Save scalers
# ============================================================

joblib.dump(
    feature_scaler,
    FEATURE_SCALER_PATH
)

joblib.dump(
    target_scaler,
    TARGET_SCALER_PATH
)

print(
    f"Feature scaler saved to: "
    f"{FEATURE_SCALER_PATH}"
)

print(
    f"Target scaler saved to: "
    f"{TARGET_SCALER_PATH}"
)


# ============================================================
# Save predictions
# ============================================================

prediction_df = test_df.iloc[
    SEQUENCE_LENGTH:
].copy()

prediction_df = prediction_df[
    ["timestamp", "target_solar"]
].copy()

prediction_df["predicted_solar"] = y_pred

prediction_df.to_csv(
    PREDICTION_PATH,
    index=False
)

print(
    f"Predictions saved to: "
    f"{PREDICTION_PATH}"
)