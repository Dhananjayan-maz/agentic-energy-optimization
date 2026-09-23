import pandas as pd
import numpy as np

# ============================================================
# CONFIGURATION
# ============================================================

INPUT_FILE = "phase1_industrial1_timeseries.csv"
OUTPUT_FILE = "energy_forecasting_features.csv"


# ============================================================
# 1. LOAD DATA
# ============================================================

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    utc=True
)

df = df.sort_values("timestamp").reset_index(drop=True)

print("=" * 60)
print("ORIGINAL DATA")
print("=" * 60)

print("Rows:", len(df))
print("Columns:", df.columns.tolist())


# ============================================================
# 2. KEEP ONLY ENERGY FORECASTING DATA
# ============================================================

df = df[
    [
        "timestamp",
        "energy_consumption_kwh"
    ]
].copy()


# ============================================================
# 3. TIME FEATURES
# ============================================================

df["hour"] = df["timestamp"].dt.hour

df["day_of_week"] = (
    df["timestamp"].dt.dayofweek
)

df["month"] = (
    df["timestamp"].dt.month
)

df["is_weekend"] = (
    df["day_of_week"] >= 5
).astype(int)


# ============================================================
# 4. LAG FEATURES
# ============================================================

# Previous 15 minutes
df["lag_1"] = (
    df["energy_consumption_kwh"].shift(1)
)

# Previous 1 hour
# 4 × 15 minutes = 1 hour
df["lag_4"] = (
    df["energy_consumption_kwh"].shift(4)
)

# Previous 1 day
# 96 × 15 minutes = 24 hours
df["lag_96"] = (
    df["energy_consumption_kwh"].shift(96)
)

# Previous 1 week
# 672 × 15 minutes = 7 days
df["lag_672"] = (
    df["energy_consumption_kwh"].shift(672)
)


# ============================================================
# 5. ROLLING FEATURES
# ============================================================

# Average energy during previous 1 hour
df["rolling_mean_4"] = (
    df["energy_consumption_kwh"]
    .shift(1)
    .rolling(window=4)
    .mean()
)

# Average energy during previous 24 hours
df["rolling_mean_96"] = (
    df["energy_consumption_kwh"]
    .shift(1)
    .rolling(window=96)
    .mean()
)

# Standard deviation during previous 24 hours
df["rolling_std_96"] = (
    df["energy_consumption_kwh"]
    .shift(1)
    .rolling(window=96)
    .std()
)


# ============================================================
# 6. CREATE TARGET
# ============================================================

# Next 15-minute energy consumption

df["target_energy"] = (
    df["energy_consumption_kwh"].shift(-1)
)


# ============================================================
# 7. REMOVE ROWS WITHOUT ENOUGH HISTORY
# ============================================================

# lag_672 requires 672 previous records.
# target_energy requires one future record.

df = df.dropna().reset_index(drop=True)


# ============================================================
# 8. DISPLAY RESULT
# ============================================================

print("\n" + "=" * 60)
print("FEATURE ENGINEERED DATA")
print("=" * 60)

print("Rows:", len(df))

print("\nColumns:")

for column in df.columns:
    print("-", column)


# ============================================================
# 9. CHECK MISSING VALUES
# ============================================================

print("\nMissing values:")

print(df.isnull().sum())


# ============================================================
# 10. CHECK DATA
# ============================================================

print("\nFirst 5 rows:")

print(df.head())

print("\nLast 5 rows:")

print(df.tail())


# ============================================================
# 11. SAVE DATASET
# ============================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 60)
print("FEATURE ENGINEERING COMPLETE")
print("=" * 60)

print(
    f"Saved as: {OUTPUT_FILE}"
)

print(
    f"Final rows: {len(df)}"
)