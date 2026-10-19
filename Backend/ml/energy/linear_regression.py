import pandas as pd
import numpy as np
import joblib

from sklearn.linear_model import LinearRegression
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

MODEL_FILE = "../saved_models/energy/linear_regression.pkl"

PREDICTIONS_FILE = (
    "../../data/energy_forecasting/"
    "linear_regression_predictions.csv"
)


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
print("ENERGY FORECASTING - LINEAR REGRESSION")
print("=" * 60)

print("Training rows:", len(train_df))
print("Testing rows:", len(test_df))


# ============================================================
# 2. DEFINE FEATURES
# ============================================================

FEATURES = [
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
    "rolling_std_96"
]

TARGET = "target_energy"


# ============================================================
# 3. CREATE X AND y
# ============================================================

X_train = train_df[FEATURES]
y_train = train_df[TARGET]

X_test = test_df[FEATURES]
y_test = test_df[TARGET]


print("\nFeatures used:")

for feature in FEATURES:
    print("-", feature)


# ============================================================
# 4. TRAIN MODEL
# ============================================================

print("\nTraining Linear Regression...")

model = LinearRegression()

model.fit(
    X_train,
    y_train
)

print("Training complete.")


# ============================================================
# 5. PREDICT TEST DATA
# ============================================================

y_pred = model.predict(X_test)


# ============================================================
# 6. EVALUATE MODEL
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
# 7. DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 60)
print("LINEAR REGRESSION RESULTS")
print("=" * 60)

print(f"MAE  : {mae:.4f} kWh")
print(f"RMSE : {rmse:.4f} kWh")
print(f"MAPE : {mape:.2f}%")
print(f"R²   : {r2:.4f}")


# ============================================================
# 8. SHOW MODEL COEFFICIENTS
# ============================================================

print("\n" + "=" * 60)
print("MODEL COEFFICIENTS")
print("=" * 60)

coefficients = pd.DataFrame({
    "feature": FEATURES,
    "coefficient": model.coef_
})

coefficients = coefficients.sort_values(
    "coefficient",
    key=abs,
    ascending=False
)

print(coefficients.to_string(index=False))


# ============================================================
# 9. SAMPLE PREDICTIONS
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
# 10. SAVE PREDICTIONS
# ============================================================

results.to_csv(
    PREDICTIONS_FILE,
    index=False
)

print("\nPredictions saved to:")
print(PREDICTIONS_FILE)


# ============================================================
# 11. SAVE TRAINED MODEL
# ============================================================

joblib.dump(
    model,
    MODEL_FILE
)

print("\nModel saved to:")
print(MODEL_FILE)


# ============================================================
# 12. FINAL COMPARISON WITH BASELINE
# ============================================================

baseline_mae = 1.8313
baseline_rmse = 2.4549
baseline_mape = 22.04
baseline_r2 = 0.6550

print("\n" + "=" * 60)
print("BASELINE vs LINEAR REGRESSION")
print("=" * 60)

print(
    f"MAE  : Baseline = {baseline_mae:.4f} | "
    f"Linear Regression = {mae:.4f}"
)

print(
    f"RMSE : Baseline = {baseline_rmse:.4f} | "
    f"Linear Regression = {rmse:.4f}"
)

print(
    f"MAPE : Baseline = {baseline_mape:.2f}% | "
    f"Linear Regression = {mape:.2f}%"
)

print(
    f"R²   : Baseline = {baseline_r2:.4f} | "
    f"Linear Regression = {r2:.4f}"
)

print("\nLinear Regression training complete.")