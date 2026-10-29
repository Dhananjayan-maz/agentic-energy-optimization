
import pandas as pd
import numpy as np
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    mean_absolute_percentage_error,
    r2_score,
)

files = [
    (
        "ENERGY LSTM",
        "data/energy_forecasting/lstm_predictions.csv",
        "target_energy",
        "predicted_energy",
        False,
    ),
    (
        "SOLAR XGBOOST",
        "data/solar_forecasting/xgboost_predictions.csv",
        "target_solar",
        "predicted_solar",
        True,
    ),
]

for name, path, actual_col, pred_col, solar in files:
    df = pd.read_csv(path).dropna(subset=[actual_col, pred_col])
    actual = df[actual_col].to_numpy()
    predicted = df[pred_col].to_numpy()

    mask = actual > 0.01 if solar else np.ones(len(actual), dtype=bool)

    print(f"\n{name}")
    print(f"Rows evaluated: {len(df)}")
    print(f"MAE:  {mean_absolute_error(actual, predicted):.4f}")
    print(f"RMSE: {np.sqrt(mean_squared_error(actual, predicted)):.4f}")
    print(
        f"MAPE: "
        f"{mean_absolute_percentage_error(actual[mask], predicted[mask]) * 100:.2f}%"
    )
    print(f"R2:   {r2_score(actual, predicted):.4f}")

    if solar:
        print(f"Rows included in MAPE: {int(mask.sum())}")
