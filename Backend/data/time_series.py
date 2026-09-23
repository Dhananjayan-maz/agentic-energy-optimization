import pandas as pd

# ============================================================
# 1. Load cleaned dataset
# ============================================================

INPUT_FILE = "phase1_industrial1_clean.csv"
OUTPUT_FILE = "phase1_industrial1_timeseries.csv"

df = pd.read_csv(INPUT_FILE)

print("Original shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())


# ============================================================
# 2. Convert timestamp
# ============================================================

df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)

# Sort chronologically
df = df.sort_values("timestamp").reset_index(drop=True)


# ============================================================
# 3. Check duplicate timestamps
# ============================================================

duplicates = df["timestamp"].duplicated().sum()

print("\nDuplicate timestamps:", duplicates)


# ============================================================
# 4. Check timestamp gaps
# ============================================================

time_diff = df["timestamp"].diff()

expected_interval = pd.Timedelta(minutes=15)

gaps = df[
    time_diff.notna() &
    (time_diff != expected_interval)
].copy()

print("\nTimestamp gaps:")
print("Number of gaps:", len(gaps))

if len(gaps) > 0:
    print(gaps[["timestamp"]].head(20))


# ============================================================
# 5. Convert cumulative readings → interval energy
# ============================================================

df["energy_consumption_kwh"] = (
    df["energy_consumption"].diff()
)

df["solar_generation_kwh"] = (
    df["solar_generation"].diff()
)


# ============================================================
# 6. Remove first row
# ============================================================

# First row has no previous reading, so its difference is NaN.
df = df.dropna(
    subset=[
        "energy_consumption_kwh",
        "solar_generation_kwh"
    ]
).reset_index(drop=True)


# ============================================================
# 7. Check negative values
# ============================================================

negative_energy = (
    df["energy_consumption_kwh"] < 0
).sum()

negative_solar = (
    df["solar_generation_kwh"] < 0
).sum()

print("\nNegative interval values:")
print("Energy:", negative_energy)
print("Solar:", negative_solar)


# ============================================================
# 8. Show negative records if any
# ============================================================

if negative_energy > 0:
    print("\nNegative energy records:")
    print(
        df[df["energy_consumption_kwh"] < 0][
            [
                "timestamp",
                "energy_consumption_kwh"
            ]
        ].head(20)
    )

if negative_solar > 0:
    print("\nNegative solar records:")
    print(
        df[df["solar_generation_kwh"] < 0][
            [
                "timestamp",
                "solar_generation_kwh"
            ]
        ].head(20)
    )


# ============================================================
# 9. Basic statistics
# ============================================================

print("\nEnergy statistics:")
print(df["energy_consumption_kwh"].describe())

print("\nSolar statistics:")
print(df["solar_generation_kwh"].describe())


# ============================================================
# 10. Check missing values
# ============================================================

print("\nMissing values:")
print(
    df[
        [
            "timestamp",
            "energy_consumption_kwh",
            "solar_generation_kwh"
        ]
    ].isnull().sum()
)


# ============================================================
# 11. Keep only required columns
# ============================================================

final_df = df[
    [
        "timestamp",
        "energy_consumption_kwh",
        "solar_generation_kwh"
    ]
]


# ============================================================
# 12. Save final dataset
# ============================================================

final_df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# 13. Final summary
# ============================================================

print("\n========================================")
print("FINAL DATASET")
print("========================================")

print("Rows:", len(final_df))
print("Columns:", final_df.columns.tolist())

print(
    "Date range:",
    final_df["timestamp"].min(),
    "to",
    final_df["timestamp"].max()
)

print("\nFirst 5 rows:")
print(final_df.head())

print("\nLast 5 rows:")
print(final_df.tail())

print(
    f"\nSaved successfully as: {OUTPUT_FILE}"
)