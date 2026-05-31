from django.core.management.base import BaseCommand
from restaurant.models import Category, MenuItem


class Command(BaseCommand):
    help = "Merge Drinks/Drink/Bebida categories into Bebidas."

    def handle(self, *args, **options):
        bebidas, _ = Category.objects.update_or_create(
            name="Bebidas",
            defaults={"is_active": True},
        )

        old_names = ["Drinks", "Drink", "Bebida", "drinks", "drink", "bebida"]

        moved_items = 0
        deleted_categories = 0

        for old_name in old_names:
            old_category = Category.objects.filter(name=old_name).first()
            if not old_category:
                continue

            items = MenuItem.objects.filter(category=old_category)
            count = items.count()
            items.update(category=bebidas)
            moved_items += count

            if old_category.id != bebidas.id:
                old_category.delete()
                deleted_categories += 1

        self.stdout.write(self.style.SUCCESS(
            f"Categories merged successfully. Moved items: {moved_items}, Deleted old categories: {deleted_categories}. Only 'Bebidas' remains."
        ))
