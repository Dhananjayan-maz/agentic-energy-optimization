
from django.core.management.base import BaseCommand

from iot.live_forecasting import aggregate_and_store_live_intervals


class Command(BaseCommand):
    help = "Aggregate simulator readings into 15-minute live intervals."

    def handle(self, *args, **options):
        result = aggregate_and_store_live_intervals(
            device_id="smart_meter_01",
            hours=24,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Intervals found: {result['intervals_found']}, "
                f"new intervals saved: {result['intervals_saved']}"
            )
        )
