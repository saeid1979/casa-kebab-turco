from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0003_menuitem_is_deleted'),
    ]

    operations = [
        migrations.CreateModel(
            name='InventoryItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=160)),
                ('unit', models.CharField(choices=[('kg', 'Kilogram'), ('g', 'Gram'), ('unit', 'Unit'), ('liter', 'Liter'), ('ml', 'Milliliter'), ('pack', 'Pack')], default='unit', max_length=20)),
                ('current_stock', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('minimum_stock', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('unit_cost', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='MenuItemIngredient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity_required', models.DecimalField(decimal_places=2, default=1, max_digits=10)),
                ('inventory_item', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='menu_links', to='restaurant.inventoryitem')),
                ('menu_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ingredients', to='restaurant.menuitem')),
            ],
            options={
                'unique_together': {('menu_item', 'inventory_item')},
            },
        ),
    ]
