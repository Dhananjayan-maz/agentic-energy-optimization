import os
import sys
import django
import pandas as pd


# Add Backend directory to Python path
BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

sys.path.insert(0, BASE_DIR)


# Setup Django
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings"
)

django.setup()

from energy.models import EnergyReading

# --------------------------------------------------
# Dataset path
# --------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "processed_data",
    "phase1_industrial1_timeseries.csv"
)


# --------------------------------------------------
# Load dataset
# --------------------------------------------------

df = pd.read_csv(DATA_PATH)

df["timestamp"] = pd.to_datetime(df["timestamp"])


print(f"Rows found: {len(df)}")


# --------------------------------------------------
# Import records
# --------------------------------------------------

records = []

for _, row in df.iterrows():

    record = EnergyReading(
        timestamp=row["timestamp"],

        energy_consumption=row["energy_consumption_kwh"],

        solar_generation=row["solar_generation_kwh"],

        # These are not available in our current
        # Industrial 1 dataset.
        temperature=0,
        humidity=0,
        irradiance=0,

        grid_energy=row["energy_consumption_kwh"],

        carbon_emission=None
    )

    records.append(record)


# --------------------------------------------------
# Bulk insert
# --------------------------------------------------

EnergyReading.objects.bulk_create(
    records,
    batch_size=1000
)


print(f"Successfully imported {len(records)} records.")