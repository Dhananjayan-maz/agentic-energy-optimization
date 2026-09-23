import pandas as pd

INPUT_FILE = "household_data_15min_singleindex_filtered.csv"
OUTPUT_FILE = "phase1_industrial1_clean.csv"

df = pd.read_csv(INPUT_FILE)

# Parse timestamp
df["timestamp"] = pd.to_datetime(
    df["utc_timestamp"],
    utc=True
)

# Select Industrial 1
data = df[
    [
        "timestamp",
        "DE_KN_industrial1_grid_import",
        "DE_KN_industrial1_pv_1",
        "DE_KN_industrial1_pv_2",
    ]
].copy()

# Calculate total PV generation
data["solar_generation"] = (
    data["DE_KN_industrial1_pv_1"]
    + data["DE_KN_industrial1_pv_2"]
)

# Rename energy column
data["energy_consumption"] = (
    data["DE_KN_industrial1_grid_import"]
)

# Keep only required columns
data = data[
    [
        "timestamp",
        "energy_consumption",
        "solar_generation",
    ]
]

# Remove rows where required values are missing
data = data.dropna(
    subset=[
        "energy_consumption",
        "solar_generation"
    ]
)

# Sort by time
data = data.sort_values("timestamp")

# Remove duplicate timestamps
data = data.drop_duplicates(
    subset="timestamp"
)

# Save
data.to_csv(
    OUTPUT_FILE,
    index=False
)

print("Dataset created successfully")
print("Rows:", len(data))
print("Start:", data["timestamp"].min())
print("End:", data["timestamp"].max())
print("\nMissing values:")
print(data.isna().sum())
print("\nDuplicates:", data["timestamp"].duplicated().sum())

