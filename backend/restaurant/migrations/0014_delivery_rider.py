from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0013_delivery_live_tracking'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeliveryRider',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('phone', models.CharField(max_length=40, unique=True)),
                ('vehicle_type', models.CharField(blank=True, default='Moto', max_length=80)),
                ('vehicle_plate', models.CharField(blank=True, max_length=80)),
                ('is_active', models.BooleanField(default=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
