import pandas as pd

# ============================================================
# CONFIGURATION
# ============================================================

INPUT_FILE = "energy_forecasting_features.csv"

TRAIN_FILE = "energy_train.csv"
TEST_FILE = "energy_test.csv"


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
print("DATASET")
print("=" * 60)

print("Total rows:", len(df))

print(
    "Start:",
    df["timestamp"].min()
)

print(
    "End:",
    df["timestamp"].max()
)


# ============================================================
# 2. CHRONOLOGICAL SPLIT
# ============================================================

# Use the beginning of 2017 as the test period.
#
# Everything before 2017:
#       TRAINING
#
# 2017 onwards:
#       TESTING

split_date = pd.Timestamp(
    "2017-01-01",
    tz="UTC"
)

train_df = df[
    df["timestamp"] < split_date
].copy()

test_df = df[
    df["timestamp"] >= split_date
].copy()


# ============================================================
# 3. DISPLAY SPLIT INFORMATION
# ============================================================

print("\n" + "=" * 60)
print("TRAIN / TEST SPLIT")
print("=" * 60)

print("\nTraining data:")
print("Rows:", len(train_df))
print("Start:", train_df["timestamp"].min())
print("End:", train_df["timestamp"].max())

print("\nTesting data:")
print("Rows:", len(test_df))
print("Start:", test_df["timestamp"].min())
print("End:", test_df["timestamp"].max())


# ============================================================
# 4. CHECK THAT TIME ORDER IS CORRECT
# ============================================================

print("\n" + "=" * 60)
print("TIME ORDER CHECK")
print("=" * 60)

print(
    "Last training timestamp:",
    train_df["timestamp"].max()
)

print(
    "First testing timestamp:",
    test_df["timestamp"].min()
)

if train_df["timestamp"].max() < test_df["timestamp"].min():
    print("PASS: Training data occurs before testing data.")
else:
    print("ERROR: Time overlap detected!")


# ============================================================
# 5. SAVE DATASETS
# ============================================================

train_df.to_csv(
    TRAIN_FILE,
    index=False
)

test_df.to_csv(
    TEST_FILE,
    index=False
)


# ============================================================
# 6. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 60)
print("FILES CREATED")
print("=" * 60)

print(TRAIN_FILE)
print(TEST_FILE)