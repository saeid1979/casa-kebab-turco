from django.core.management.base import BaseCommand
from restaurant.models import Category, MenuItem, Expense


class Command(BaseCommand):
    help = 'Create initial restaurant menu and sample expenses'

    def handle(self, *args, **kwargs):
        categories = {
            'Kebab': [
                ('Chicken Doner Kebab', 'Fresh chicken doner with salad and sauce', 6.50),
                ('Beef Doner Kebab', 'Beef doner with fresh vegetables', 7.50),
                ('Mixed Kebab', 'Chicken and beef mix', 8.50),
            ],
            'Plates': [
                ('Kebab Plate with Rice', 'Kebab with rice, salad and sauce', 10.50),
                ('Falafel Plate', 'Falafel with rice and salad', 8.50),
            ],
            'Drinks': [
                ('Coca Cola', 'Cold drink', 2.00),
                ('Water', 'Bottle of water', 1.50),
            ],
        }

        for cat_name, items in categories.items():
            category, _ = Category.objects.get_or_create(name=cat_name)
            for name, description, price in items:
                MenuItem.objects.get_or_create(
                    category=category,
                    name=name,
                    defaults={'description': description, 'price': price}
                )

        Expense.objects.get_or_create(title='Monthly Rent', defaults={'amount': 408, 'category': 'Rent'})
        Expense.objects.get_or_create(title='Gas and Electricity', defaults={'amount': 250, 'category': 'Utilities'})

        self.stdout.write(self.style.SUCCESS('Initial data created successfully.'))
