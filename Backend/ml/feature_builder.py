import pandas as pd


# --------------------------------------------------
# Energy feature builder
# --------------------------------------------------

def build_energy_features(readings):
    """
    Convert Django EnergyReading objects into the
    features required by the trained Energy LSTM.
    """

    data = []

    for reading in readings:
        data.append({
            "timestamp": reading.timestamp,
            "energy_consumption_kwh": reading.energy_consumption,
        })

    df = pd.DataFrame(data)

    if df.empty:
        raise ValueError("No energy readings available.")

    # Ensure chronological order
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Time features
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.dayofweek
    df["month"] = df["timestamp"].dt.month
    df["is_weekend"] = (
        df["day_of_week"] >= 5
    ).astype(int)

    # Lag features
    df["lag_1"] = df["energy_consumption_kwh"].shift(1)
    df["lag_4"] = df["energy_consumption_kwh"].shift(4)
    df["lag_96"] = df["energy_consumption_kwh"].shift(96)
    df["lag_672"] = df["energy_consumption_kwh"].shift(672)

    # IMPORTANT:
    # Shift first so the current value is not included
    # in its own rolling statistics.
    previous_energy = df["energy_consumption_kwh"].shift(1)

    df["rolling_mean_4"] = (
        previous_energy
        .rolling(window=4)
        .mean()
    )

    df["rolling_mean_96"] = (
        previous_energy
        .rolling(window=96)
        .mean()
    )

    df["rolling_std_96"] = (
        previous_energy
        .rolling(window=96)
        .std()
    )

    # Keep exactly the features used during LSTM training
    feature_columns = [
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

    features = df[feature_columns].dropna().reset_index(drop=True)

    return features


def build_solar_features(readings):
    data = []

    for reading in readings:
        data.append({
            "timestamp": reading.timestamp,
            "solar_generation_kwh": reading.solar_generation,
        })

    df = pd.DataFrame(data)

    if df.empty:
        raise ValueError("No solar readings available.")

    df = df.sort_values("timestamp").reset_index(drop=True)

    # Time features
    df["hour"] = df["timestamp"].dt.hour
    df["minute"] = df["timestamp"].dt.minute
    df["hour_decimal"] = (
        df["timestamp"].dt.hour
        + df["timestamp"].dt.minute / 60
    )
    df["day_of_week"] = df["timestamp"].dt.dayofweek
    df["month"] = df["timestamp"].dt.month
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

    # Lag features
    df["lag_1"] = df["solar_generation_kwh"].shift(1)
    df["lag_4"] = df["solar_generation_kwh"].shift(4)
    df["lag_96"] = df["solar_generation_kwh"].shift(96)
    df["lag_672"] = df["solar_generation_kwh"].shift(672)

    # Rolling features
    previous_solar = df["solar_generation_kwh"].shift(1)

    df["rolling_mean_4"] = previous_solar.rolling(window=4).mean()
    df["rolling_mean_96"] = previous_solar.rolling(window=96).mean()
    df["rolling_std_96"] = previous_solar.rolling(window=96).std()

    feature_columns = [
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

    features = df[feature_columns].dropna().reset_index(drop=True)

    return features