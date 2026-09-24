import pandas as pd
import numpy as np
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    mean_absolute_percentage_error,
    r2_score
)


# ============================================================
# CONFIGURATION
# ============================================================

TRAIN_FILE = "../../data/energy_forecasting/energy_train.csv"
TEST_FILE = "../../data/energy_forecasting/energy_test.csv"


# ============================================================
# 1. LOAD DATA
# ============================================================

train_df = pd.read_csv(TRAIN_FILE)
test_df = pd.read_csv(TEST_FILE)

train_df["timestamp"] = pd.to_datetime(
    train_df["timestamp"],
    utc=True
)

test_df["timestamp"] = pd.to_datetime(
    test_df["timestamp"],
    utc=True
)


print("=" * 60)
print("ENERGY FORECASTING - BASELINE")
print("=" * 60)

print("Training rows:", len(train_df))
print("Testing rows:", len(test_df))


# ============================================================
# 2. ACTUAL VALUES
# ============================================================

y_test = test_df["target_energy"]


# ============================================================
# 3. BASELINE PREDICTION
# ============================================================

# Predict the next 15-minute energy value
# using the previous 15-minute energy value.

y_pred = test_df["lag_1"]


# ============================================================
# 4. EVALUATION
# ============================================================

mae = mean_absolute_error(
    y_test,
    y_pred
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        y_pred
    )
)

mape = mean_absolute_percentage_error(
    y_test,
    y_pred
) * 100

r2 = r2_score(
    y_test,
    y_pred
)


# ============================================================
# 5. RESULTS
# ============================================================

print("\n" + "=" * 60)
print("BASELINE RESULTS")
print("=" * 60)

print(f"MAE  : {mae:.4f} kWh")
print(f"RMSE : {rmse:.4f} kWh")
print(f"MAPE : {mape:.2f}%")
print(f"R²   : {r2:.4f}")


# ============================================================
# 6. SHOW SAMPLE PREDICTIONS
# ============================================================

results = pd.DataFrame({
    "timestamp": test_df["timestamp"],
    "actual_energy": y_test,
    "predicted_energy": y_pred
})

print("\n" + "=" * 60)
print("SAMPLE PREDICTIONS")
print("=" * 60)

print(results.head(20))


# ============================================================
# 7. SAVE RESULTS
# ============================================================

results.to_csv(
    "../../data/energy_forecasting/baseline_predictions.csv",
    index=False
)

print("\nPredictions saved to:")
print("data/energy_forecasting/baseline_predictions.csv")