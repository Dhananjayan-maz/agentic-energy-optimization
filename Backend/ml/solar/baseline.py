import pandas as pd
import numpy as np
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    mean_absolute_percentage_error,
    r2_score
)


# ============================================================
# Load test data
# ============================================================

test_path = "../../data/solar_forecasting/solar_test.csv"

test_df = pd.read_csv(test_path)


# ============================================================
# Actual values
# ============================================================

y_test = test_df["target_solar"]


# ============================================================
# Baseline prediction
# ============================================================

# Predict the next 15-minute solar generation
# using the previous 15-minute solar generation.

y_pred = test_df["lag_1"]


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

# mape = mean_absolute_percentage_error(
#     y_test,
#     y_pred
# ) * 100

mask = y_test > 0.01

mape = mean_absolute_percentage_error(
    y_test[mask],
    y_pred[mask]
) * 100

r2 = r2_score(
    y_test,
    y_pred
)


# ============================================================
# Results
# ============================================================

print("\nSolar Baseline Results")
print("----------------------------")

print(f"MAE  : {mae:.4f} kWh")
print(f"RMSE : {rmse:.4f} kWh")
print(f"MAPE : {mape:.2f}%")
print(f"R²   : {r2:.4f}")


# ============================================================
# Save predictions
# ============================================================

predictions = test_df[
    ["timestamp", "target_solar"]
].copy()

predictions["predicted_solar"] = y_pred

output_path = "../../data/solar_forecasting/baseline_predictions.csv"

predictions.to_csv(
    output_path,
    index=False
)

print(
    f"\nPredictions saved to: {output_path}"
)