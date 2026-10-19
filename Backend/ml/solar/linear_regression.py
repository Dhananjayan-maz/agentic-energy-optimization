import pandas as pd
import joblib
import numpy as np

from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    mean_absolute_percentage_error,
    r2_score
)


# ============================================================
# Load train and test data
# ============================================================

train_path = "../../data/solar_forecasting/solar_train.csv"
test_path = "../../data/solar_forecasting/solar_test.csv"

train_df = pd.read_csv(train_path)
test_df = pd.read_csv(test_path)


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


X_train = train_df[features]
y_train = train_df[target]

X_test = test_df[features]
y_test = test_df[target]


# ============================================================
# Create Linear Regression model
# ============================================================

model = LinearRegression()


# ============================================================
# Train
# ============================================================

print("Training Solar Linear Regression model...")

model.fit(X_train, y_train)

print("Training completed.")


# ============================================================
# Prediction
# ============================================================

y_pred = model.predict(X_test)


# ============================================================
# Evaluation
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

# Solar-specific MAPE:
# Ignore zero / near-zero actual solar generation.
mape_mask = y_test > 0.01

mape = mean_absolute_percentage_error(
    y_test[mape_mask],
    y_pred[mape_mask]
) * 100

r2 = r2_score(
    y_test,
    y_pred
)


# ============================================================
# Results
# ============================================================

print("\nSolar Linear Regression Results")
print("----------------------------")

print(f"MAE  : {mae:.4f} kWh")
print(f"RMSE : {rmse:.4f} kWh")
print(f"MAPE : {mape:.2f}%")
print(f"R²   : {r2:.4f}")


# ============================================================
# Save model
# ============================================================

model_path = "../saved_models/solar/linear_regression.pkl"

joblib.dump(
    model,
    model_path
)

print(
    f"\nModel saved to: {model_path}"
)


# ============================================================
# Save predictions
# ============================================================

predictions = test_df[
    ["timestamp", "target_solar"]
].copy()

predictions["predicted_solar"] = y_pred

prediction_path = "../../data/solar_forecasting/linear_regression_predictions.csv"

predictions.to_csv(
    prediction_path,
    index=False
)

print(
    f"Predictions saved to: {prediction_path}"
)


# ============================================================
# Display coefficients
# ============================================================

print("\nFeature coefficients:")

coefficients = pd.DataFrame({
    "feature": features,
    "coefficient": model.coef_
})

print(
    coefficients.sort_values(
        "coefficient",
        ascending=False
    ).to_string(index=False)
)