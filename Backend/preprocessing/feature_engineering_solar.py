import pandas as pd


# ============================================================
# Load processed time-series data
# ============================================================

input_path = "../data/processed_data/phase1_industrial1_timeseries.csv"
output_path = "../data/solar_forecasting/solar_forecasting_features.csv"

df = pd.read_csv(input_path)

df["timestamp"] = pd.to_datetime(df["timestamp"])

df = df.sort_values("timestamp").reset_index(drop=True)


# ============================================================
# Time-based features
# ============================================================

df["hour"] = df["timestamp"].dt.hour
df["minute"] = df["timestamp"].dt.minute

# Convert time to a decimal representation
df["hour_decimal"] = (
    df["hour"] + df["minute"] / 60
)

df["day_of_week"] = df["timestamp"].dt.dayofweek
df["month"] = df["timestamp"].dt.month

df["is_weekend"] = (
    df["day_of_week"] >= 5
).astype(int)


# ============================================================
# Solar lag features
# ============================================================

df["lag_1"] = df["solar_generation_kwh"].shift(1)

# Previous 1 hour
df["lag_4"] = df["solar_generation_kwh"].shift(4)

# Previous 1 day
df["lag_96"] = df["solar_generation_kwh"].shift(96)

# Previous 1 week
df["lag_672"] = df["solar_generation_kwh"].shift(672)


# ============================================================
# Rolling features
# ============================================================

# IMPORTANT:
# shift(1) prevents the current solar value from entering
# its own prediction features.

previous_solar = df["solar_generation_kwh"].shift(1)

# Previous 1 hour
df["rolling_mean_4"] = (
    previous_solar
    .rolling(window=4)
    .mean()
)

# Previous 24 hours
df["rolling_mean_96"] = (
    previous_solar
    .rolling(window=96)
    .mean()
)

df["rolling_std_96"] = (
    previous_solar
    .rolling(window=96)
    .std()
)


# ============================================================
# Target
# ============================================================

# Predict the next 15-minute solar generation

df["target_solar"] = (
    df["solar_generation_kwh"].shift(-1)
)


# ============================================================
# Select final columns
# ============================================================

features = [
    "timestamp",
    "solar_generation_kwh",

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

    "target_solar"
]

df = df[features]

# ============================================================
# Remove rows with insufficient history / target
# ============================================================
print(f"Initial rows: {len(df)}")
df = df.dropna().reset_index(drop=True)



# ============================================================
# Validation
# ============================================================

print("Solar feature engineering completed.")
print("------------------------------------")

print(f"Rows: {len(df)}")
print(f"Columns: {len(df.columns)}")

print(
    f"Date range: "
    f"{df['timestamp'].min()} "
    f"to "
    f"{df['timestamp'].max()}"
)

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate rows:")
print(df.duplicated().sum())

print("\nSolar target statistics:")
print(df["target_solar"].describe())


# ============================================================
# Save
# ============================================================

df.to_csv(
    output_path,
    index=False
)

print(
    f"\nFeatures saved to: {output_path}"
)