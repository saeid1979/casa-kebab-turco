
from django.core.management.base import BaseCommand
from restaurant.models import Order, DeliveryTracking
import secrets


class Command(BaseCommand):
    help = "Create delivery live tracking link for an order."

    def add_arguments(self, parser):
        parser.add_argument("order_id", type=int)
        parser.add_argument("--rider", default="Repartidor")
        parser.add_argument("--phone", default="600000000")

    def handle(self, *args, **options):
        order_id = options["order_id"]
        rider = options["rider"]
        phone = options["phone"]

        order = Order.objects.filter(id=order_id).first()
        if not order:
            self.stdout.write(self.style.ERROR("Order not found."))
            return

        tracking, created = DeliveryTracking.objects.get_or_create(
            order=order,
            defaults={
                "token": secrets.token_urlsafe(32),
                "rider_name": rider,
                "rider_phone": phone,
                "is_active": True,
            },
        )

        if not created:
            tracking.rider_name = rider
            tracking.rider_phone = phone
            tracking.is_active = True
            tracking.stopped_at = None
            tracking.save()

        order.status = "out_for_delivery"
        order.save(update_fields=["status"])

        self.stdout.write(self.style.SUCCESS("Delivery tracking link created."))
        self.stdout.write(f"Order: CDKT-{order.id:06d}")
        self.stdout.write(f"Token: {tracking.token}")
        self.stdout.write(f"Delivery URL: http://127.0.0.1:5173/delivery?token={tracking.token}")
        self.stdout.write("Customer tracking URL: http://127.0.0.1:5173/track")
        self.stdout.write("Admin tracking URL: http://127.0.0.1:5173/delivery-admin")
