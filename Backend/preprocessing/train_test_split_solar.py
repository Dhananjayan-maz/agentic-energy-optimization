import pandas as pd


# ============================================================
# Load solar features
# ============================================================

input_path = "../data/solar_forecasting/solar_forecasting_features.csv"

train_output = "../data/solar_forecasting/solar_train.csv"
test_output = "../data/solar_forecasting/solar_test.csv"

df = pd.read_csv(input_path)

df["timestamp"] = pd.to_datetime(df["timestamp"])

df = df.sort_values("timestamp").reset_index(drop=True)


# ============================================================
# Define chronological cutoff
# ============================================================

cutoff_date = pd.Timestamp("2017-01-01", tz="UTC")


# ============================================================
# Split
# ============================================================

train_df = df[df["timestamp"] < cutoff_date].copy()

test_df = df[df["timestamp"] >= cutoff_date].copy()


# ============================================================
# Save
# ============================================================

train_df.to_csv(train_output, index=False)

test_df.to_csv(test_output, index=False)


# ============================================================
# Validation
# ============================================================

print("Solar train/test split completed.")
print("----------------------------------")

print(f"Total rows : {len(df)}")
print(f"Train rows : {len(train_df)}")
print(f"Test rows  : {len(test_df)}")

print("\nTraining period:")
print(train_df["timestamp"].min())
print(train_df["timestamp"].max())

print("\nTesting period:")
print(test_df["timestamp"].min())
print(test_df["timestamp"].max())


# Check chronological order

if train_df["timestamp"].max() < test_df["timestamp"].min():
    print("\nTime order check: PASS")
else:
    print("\nTime order check: FAIL")


# Check overlap

overlap = set(train_df["timestamp"]).intersection(
    set(test_df["timestamp"])
)

print(f"Timestamp overlap: {len(overlap)}")


# Check missing values

print("\nMissing values - train:")
print(train_df.isnull().sum().sum())

print("\nMissing values - test:")
print(test_df.isnull().sum().sum())