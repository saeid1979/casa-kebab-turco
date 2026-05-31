from decimal import Decimal

from django.core.management.base import BaseCommand
from restaurant.models import Category, MenuItem


DRINKS = [
    ("Coca-Cola 33ml", "Bebida fría", Decimal("1.50")),
    ("Coca-Cola Zero 33ml", "Bebida fría sin azúcar", Decimal("1.50")),
    ("Pepsi 33ml", "Bebida fría", Decimal("1.50")),
    ("Sprite 33ml", "Bebida fría", Decimal("1.50")),
    ("Fanta Limón 33ml", "Bebida fría", Decimal("1.50")),
    ("Fanta Naranja 33ml", "Bebida fría", Decimal("1.50")),
    ("Zumo Bifrutas Tropical 33ml", "Bebida fría", Decimal("1.50")),
    ("Nestea 33ml", "Bebida fría", Decimal("1.95")),
    ("Red Bull", "Bebida energética", Decimal("2.50")),
    ("Monster", "Bebida energética", Decimal("2.50")),
    ("Coca-Cola 2 Litros", "Bebida familiar", Decimal("3.50")),
    ("Coca-Cola 1 Litro", "Bebida familiar", Decimal("2.50")),
    ("Fanta Naranja 1 Litro", "Bebida familiar", Decimal("2.50")),
    ("Fanta Limón 2 Litros", "Bebida familiar", Decimal("3.50")),
]


class Command(BaseCommand):
    help = "Create or update drinks in the Bebidas category."

    def handle(self, *args, **options):
        category, _ = Category.objects.update_or_create(
            name="Bebidas",
            defaults={"is_active": True},
        )

        created_count = 0
        updated_count = 0

        for name, description, price in DRINKS:
            item, created = MenuItem.objects.update_or_create(
                name=name,
                defaults={
                    "description": description,
                    "price": price,
                    "category": category,
                    "is_available": True,
                    "preparation_minutes": 1,
                },
            )

            if hasattr(item, "is_deleted") and item.is_deleted:
                item.is_deleted = False
                item.save(update_fields=["is_deleted"])

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Bebidas inserted/updated successfully. Created: {created_count}, Updated: {updated_count}"
        ))
