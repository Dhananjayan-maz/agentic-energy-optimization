import os
import sys
import django


# --------------------------------------------------
# Setup Django
# --------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

sys.path.insert(0, BASE_DIR)

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings"
)

django.setup()


# --------------------------------------------------
# Imports
# --------------------------------------------------

from energy.models import EnergyReading
from ml.feature_builder import build_energy_features


# --------------------------------------------------
# Get database readings
# --------------------------------------------------

readings = list(
    EnergyReading.objects
    .order_by("timestamp")
)


print("\n------------------------------")
print("DATABASE FEATURE BUILDER TEST")
print("------------------------------")

print(f"Database readings : {len(readings)}")


# --------------------------------------------------
# Build features
# --------------------------------------------------

features = build_energy_features(readings)


print(f"Feature rows      : {len(features)}")
print(f"Feature columns   : {len(features.columns)}")

print("\nFeature columns:")
print(list(features.columns))


# --------------------------------------------------
# Check missing values
# --------------------------------------------------

print("\nMissing values:")
print(features.isnull().sum())


# --------------------------------------------------
# Show final rows
# --------------------------------------------------

print("\nLast 3 feature rows:")
print(features.tail(3))


print("\n------------------------------")
print("Feature builder test complete!")
print("------------------------------")