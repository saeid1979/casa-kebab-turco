from decimal import Decimal

from django.core.management.base import BaseCommand
from restaurant.models import Category, MenuItem


CATEGORIES = [
    "MENÚS",
    "OFERTAS",
    "KEBABS",
    "DÜRÜMS",
    "EN PLATO",
    "RACIONES",
    "EXTRAS",
    "BEBIDAS",
]


DRINKS = [
    {
        "name": "Pepsi Regular Refresco de Cola Lata 330ml",
        "description": "Refresco de cola lata 330ml.",
        "price": "1.50",
    },
    {
        "name": "Pepsi Light Refresco de Cola reducido en Azúcar 330ml",
        "description": "Refresco de cola reducido en azúcar lata 330ml.",
        "price": "1.50",
    },
    {
        "name": "Fanta Naranja 0.33L",
        "description": "Lata.",
        "price": "1.50",
    },
    {
        "name": "Sprite 0.33L",
        "description": "Lata.",
        "price": "1.50",
    },
    {
        "name": "Nestea 0.33L",
        "description": "Lata.",
        "price": "1.50",
    },
    {
        "name": "Agua 0.5L",
        "description": "Botella.",
        "price": "1.00",
    },
]


class Command(BaseCommand):
    help = "Seed initial restaurant menu categories and drinks without duplicates."

    def handle(self, *args, **options):
        category_map = {}

        for category_name in CATEGORIES:
            category, created = Category.objects.update_or_create(
                name=category_name,
                defaults={"is_active": True},
            )
            category_map[category_name] = category

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {category_name}"))
            else:
                self.stdout.write(f"Category exists: {category_name}")

        bebidas = category_map["BEBIDAS"]

        created_count = 0
        updated_count = 0

        for item in DRINKS:
            menu_item, created = MenuItem.objects.update_or_create(
                name=item["name"],
                defaults={
                    "description": item["description"],
                    "price": Decimal(item["price"]),
                    "category": bebidas,
                    "is_available": True,
                    "preparation_minutes": 1,
                },
            )

            if hasattr(menu_item, "is_deleted") and menu_item.is_deleted:
                menu_item.is_deleted = False
                menu_item.save(update_fields=["is_deleted"])

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created drink: {item['name']}"))
            else:
                updated_count += 1
                self.stdout.write(f"Updated drink: {item['name']}")

        self.stdout.write(self.style.SUCCESS(""))
        self.stdout.write(self.style.SUCCESS("Initial menu seed completed."))
        self.stdout.write(self.style.SUCCESS(f"Drinks created: {created_count}"))
        self.stdout.write(self.style.SUCCESS(f"Drinks updated: {updated_count}"))
