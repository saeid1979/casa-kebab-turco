from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0007_customer_payment_flow'),
    ]

    operations = [
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=160)),
                ('phone', models.CharField(max_length=40, unique=True)),
                ('address', models.TextField(blank=True)),
                ('last_order_at', models.DateTimeField(blank=True, null=True)),
                ('total_orders', models.PositiveIntegerField(default=0)),
                ('total_spent', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.AddField(
            model_name='order',
            name='customer',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='restaurant.customer'),
        ),
    ]
