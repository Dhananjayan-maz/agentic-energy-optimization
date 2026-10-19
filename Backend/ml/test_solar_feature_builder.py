import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from energy.models import EnergyReading
from ml.feature_builder import build_solar_features


readings = list(
    EnergyReading.objects.order_by("timestamp")
)

print("\n------------------------------")
print("SOLAR FEATURE BUILDER TEST")
print("------------------------------")

print(f"Database readings : {len(readings)}")

features = build_solar_features(readings)

print(f"Feature rows      : {len(features)}")
print(f"Feature columns   : {len(features.columns)}")

print("\nFeature columns:")
print(list(features.columns))

print("\nMissing values:")
print(features.isnull().sum())

print("\nLast 3 feature rows:")
print(features.tail(3))

print("\n------------------------------")
print("Solar feature builder test complete!")
print("------------------------------")