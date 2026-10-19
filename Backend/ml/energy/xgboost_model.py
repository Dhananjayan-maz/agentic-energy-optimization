import pandas as pd
import joblib
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error, r2_score
import numpy as np

# -----------------------------
# Load train and test data
# -----------------------------

train_path = "../../data/energy_forecasting/energy_train.csv"
test_path = "../../data/energy_forecasting/energy_test.csv"

train_df = pd.read_csv(train_path)
test_df = pd.read_csv(test_path)

# -----------------------------
# Features and target
# -----------------------------

features = [
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

target = "target_energy"

X_train = train_df[features]
y_train = train_df[target]

X_test = test_df[features]
y_test = test_df[target]

# -----------------------------
# Create XGBoost model
# -----------------------------

model = XGBRegressor(
    n_estimators=500,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=42,
    n_jobs=-1
)

# -----------------------------
# Train
# -----------------------------

print("Training XGBoost model...")

model.fit(X_train, y_train)

print("Training completed.")

# -----------------------------
# Prediction
# -----------------------------

y_pred = model.predict(X_test)

# -----------------------------
# Evaluation
# -----------------------------

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mape = mean_absolute_percentage_error(y_test, y_pred) * 100
r2 = r2_score(y_test, y_pred)

print("\nXGBoost Results")
print("----------------------------")
print(f"MAE  : {mae:.4f} kWh")
print(f"RMSE : {rmse:.4f} kWh")
print(f"MAPE : {mape:.2f}%")
print(f"R²   : {r2:.4f}")

# -----------------------------
# Save model
# -----------------------------

model_path = "../saved_models/energy/xgboost.pkl"

joblib.dump(model, model_path)

print(f"\nModel saved to: {model_path}")

# -----------------------------
# Save predictions
# -----------------------------

predictions = test_df[["timestamp", "target_energy"]].copy()
predictions["predicted_energy"] = y_pred

prediction_path = "../../data/energy_forecasting/xgboost_predictions.csv"

predictions.to_csv(prediction_path, index=False)

print(f"Predictions saved to: {prediction_path}")