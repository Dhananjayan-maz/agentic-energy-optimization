import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# ============================================================
# CONFIGURATION
# ============================================================

INPUT_FILE = "phase1_industrial1_timeseries.csv"

# ============================================================
# 1. LOAD DATA
# ============================================================

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)

df = df.sort_values("timestamp").reset_index(drop=True)

print("=" * 60)
print("DATASET INFORMATION")
print("=" * 60)

print("Rows:", len(df))
print("Columns:", df.columns.tolist())

print("\nDate range:")
print("Start:", df["timestamp"].min())
print("End  :", df["timestamp"].max())

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate timestamps:")
print(df["timestamp"].duplicated().sum())


# ============================================================
# 2. BASIC STATISTICS
# ============================================================

print("\n" + "=" * 60)
print("DESCRIPTIVE STATISTICS")
print("=" * 60)

print("\nEnergy consumption:")
print(df["energy_consumption_kwh"].describe())

print("\nSolar generation:")
print(df["solar_generation_kwh"].describe())


# ============================================================
# 3. ADD TIME FEATURES
# ============================================================

df["hour"] = df["timestamp"].dt.hour
df["day_of_week"] = df["timestamp"].dt.dayofweek
df["day_name"] = df["timestamp"].dt.day_name()
df["month"] = df["timestamp"].dt.month
df["year"] = df["timestamp"].dt.year
df["date"] = df["timestamp"].dt.date

df["is_weekend"] = df["day_of_week"] >= 5


# ============================================================
# 4. HOURLY AGGREGATION
# ============================================================

hourly = (
    df.set_index("timestamp")
      .resample("1h")
      .agg({
          "energy_consumption_kwh": "sum",
          "solar_generation_kwh": "sum"
      })
      .reset_index()
)

hourly.to_csv("phase1_hourly_data.csv", index=False)

print("\nHourly dataset saved:")
print("phase1_hourly_data.csv")


# ============================================================
# 5. DAILY AGGREGATION
# ============================================================

daily = (
    df.set_index("timestamp")
      .resample("1D")
      .agg({
          "energy_consumption_kwh": "sum",
          "solar_generation_kwh": "sum"
      })
      .reset_index()
)

daily.to_csv("phase1_daily_data.csv", index=False)

print("Daily dataset saved:")
print("phase1_daily_data.csv")


# ============================================================
# 6. WEEKLY AGGREGATION
# ============================================================

weekly = (
    df.set_index("timestamp")
      .resample("1W")
      .agg({
          "energy_consumption_kwh": "sum",
          "solar_generation_kwh": "sum"
      })
      .reset_index()
)

weekly.to_csv("phase1_weekly_data.csv", index=False)

print("Weekly dataset saved:")
print("phase1_weekly_data.csv")


# ============================================================
# 7. MONTHLY AGGREGATION
# ============================================================

monthly = (
    df.set_index("timestamp")
      .resample("1ME")
      .agg({
          "energy_consumption_kwh": "sum",
          "solar_generation_kwh": "sum"
      })
      .reset_index()
)

monthly.to_csv("phase1_monthly_data.csv", index=False)

print("Monthly dataset saved:")
print("phase1_monthly_data.csv")


# ============================================================
# 8. AVERAGE ENERGY BY HOUR
# ============================================================

hourly_pattern = (
    df.groupby("hour")["energy_consumption_kwh"]
      .mean()
)

print("\n" + "=" * 60)
print("AVERAGE ENERGY CONSUMPTION BY HOUR")
print("=" * 60)

print(hourly_pattern)


# ============================================================
# 9. AVERAGE SOLAR BY HOUR
# ============================================================

solar_hourly_pattern = (
    df.groupby("hour")["solar_generation_kwh"]
      .mean()
)

print("\n" + "=" * 60)
print("AVERAGE SOLAR GENERATION BY HOUR")
print("=" * 60)

print(solar_hourly_pattern)


# ============================================================
# 10. WEEKDAY VS WEEKEND
# ============================================================

weekday_energy = (
    df[~df["is_weekend"]]["energy_consumption_kwh"]
    .mean()
)

weekend_energy = (
    df[df["is_weekend"]]["energy_consumption_kwh"]
    .mean()
)

print("\n" + "=" * 60)
print("WEEKDAY VS WEEKEND")
print("=" * 60)

print("Average weekday energy :", weekday_energy)
print("Average weekend energy :", weekend_energy)


# ============================================================
# 11. ENERGY OUTLIERS USING IQR
# ============================================================

Q1_energy = df["energy_consumption_kwh"].quantile(0.25)
Q3_energy = df["energy_consumption_kwh"].quantile(0.75)

IQR_energy = Q3_energy - Q1_energy

lower_energy = Q1_energy - 1.5 * IQR_energy
upper_energy = Q3_energy + 1.5 * IQR_energy

energy_outliers = df[
    (df["energy_consumption_kwh"] < lower_energy) |
    (df["energy_consumption_kwh"] > upper_energy)
].copy()

print("\n" + "=" * 60)
print("ENERGY OUTLIERS")
print("=" * 60)

print("Lower threshold:", lower_energy)
print("Upper threshold:", upper_energy)
print("Number of outliers:", len(energy_outliers))

print("\nTop energy values:")
print(
    df[
        [
            "timestamp",
            "energy_consumption_kwh"
        ]
    ]
    .sort_values(
        "energy_consumption_kwh",
        ascending=False
    )
    .head(20)
)


# ============================================================
# 12. SOLAR OUTLIERS USING IQR
# ============================================================

Q1_solar = df["solar_generation_kwh"].quantile(0.25)
Q3_solar = df["solar_generation_kwh"].quantile(0.75)

IQR_solar = Q3_solar - Q1_solar

lower_solar = Q1_solar - 1.5 * IQR_solar
upper_solar = Q3_solar + 1.5 * IQR_solar

solar_outliers = df[
    (df["solar_generation_kwh"] < lower_solar) |
    (df["solar_generation_kwh"] > upper_solar)
].copy()

print("\n" + "=" * 60)
print("SOLAR OUTLIERS")
print("=" * 60)

print("Lower threshold:", lower_solar)
print("Upper threshold:", upper_solar)
print("Number of outliers:", len(solar_outliers))


# ============================================================
# 13. SAVE OUTLIERS
# ============================================================

energy_outliers[
    [
        "timestamp",
        "energy_consumption_kwh",
        "solar_generation_kwh"
    ]
].to_csv(
    "energy_outliers.csv",
    index=False
)

solar_outliers[
    [
        "timestamp",
        "energy_consumption_kwh",
        "solar_generation_kwh"
    ]
].to_csv(
    "solar_outliers.csv",
    index=False
)

print("\nOutlier files saved:")
print("energy_outliers.csv")
print("solar_outliers.csv")


# ============================================================
# 14. PLOT — ENERGY OVER TIME
# ============================================================

plt.figure(figsize=(14, 5))

plt.plot(
    df["timestamp"],
    df["energy_consumption_kwh"],
    linewidth=0.5
)

plt.title("Industrial 1 Energy Consumption Over Time")
plt.xlabel("Time")
plt.ylabel("Energy Consumption (kWh / 15 min)")
plt.tight_layout()

plt.savefig(
    "energy_over_time.png",
    dpi=150
)

plt.show()


# ============================================================
# 15. PLOT — SOLAR OVER TIME
# ============================================================

plt.figure(figsize=(14, 5))

plt.plot(
    df["timestamp"],
    df["solar_generation_kwh"],
    linewidth=0.5
)

plt.title("Industrial 1 Solar Generation Over Time")
plt.xlabel("Time")
plt.ylabel("Solar Generation (kWh / 15 min)")
plt.tight_layout()

plt.savefig(
    "solar_over_time.png",
    dpi=150
)

plt.show()


# ============================================================
# 16. PLOT — AVERAGE ENERGY BY HOUR
# ============================================================

plt.figure(figsize=(10, 5))

plt.plot(
    hourly_pattern.index,
    hourly_pattern.values,
    marker="o"
)

plt.title("Average Energy Consumption by Hour")
plt.xlabel("Hour of Day")
plt.ylabel("Average Energy (kWh / 15 min)")
plt.xticks(range(24))
plt.grid(True)

plt.tight_layout()

plt.savefig(
    "average_energy_by_hour.png",
    dpi=150
)

plt.show()


# ============================================================
# 17. PLOT — AVERAGE SOLAR BY HOUR
# ============================================================

plt.figure(figsize=(10, 5))

plt.plot(
    solar_hourly_pattern.index,
    solar_hourly_pattern.values,
    marker="o"
)

plt.title("Average Solar Generation by Hour")
plt.xlabel("Hour of Day")
plt.ylabel("Average Solar (kWh / 15 min)")
plt.xticks(range(24))
plt.grid(True)

plt.tight_layout()

plt.savefig(
    "average_solar_by_hour.png",
    dpi=150
)

plt.show()


# ============================================================
# 18. PLOT — DAILY ENERGY
# ============================================================

plt.figure(figsize=(14, 5))

plt.plot(
    daily["timestamp"],
    daily["energy_consumption_kwh"],
    linewidth=0.7
)

plt.title("Daily Energy Consumption")
plt.xlabel("Date")
plt.ylabel("Daily Energy (kWh)")
plt.tight_layout()

plt.savefig(
    "daily_energy.png",
    dpi=150
)

plt.show()


# ============================================================
# 19. PLOT — DAILY SOLAR
# ============================================================

plt.figure(figsize=(14, 5))

plt.plot(
    daily["timestamp"],
    daily["solar_generation_kwh"],
    linewidth=0.7
)

plt.title("Daily Solar Generation")
plt.xlabel("Date")
plt.ylabel("Daily Solar (kWh)")
plt.tight_layout()

plt.savefig(
    "daily_solar.png",
    dpi=150
)

plt.show()


# ============================================================
# 20. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 60)
print("EDA COMPLETE")
print("=" * 60)

print("Original records:", len(df))

print(
    "Energy outliers:",
    len(energy_outliers)
)

print(
    "Solar outliers:",
    len(solar_outliers)
)

print(
    "Average 15-min energy:",
    df["energy_consumption_kwh"].mean()
)

print(
    "Average 15-min solar:",
    df["solar_generation_kwh"].mean()
)

print("\nGenerated files:")

files = [
    "phase1_hourly_data.csv",
    "phase1_daily_data.csv",
    "phase1_weekly_data.csv",
    "phase1_monthly_data.csv",
    "energy_outliers.csv",
    "solar_outliers.csv",
    "energy_over_time.png",
    "solar_over_time.png",
    "average_energy_by_hour.png",
    "average_solar_by_hour.png",
    "daily_energy.png",
    "daily_solar.png"
]

for file in files:
    print("-", file)