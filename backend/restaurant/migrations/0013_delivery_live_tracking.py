from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0012_merge_coming_soon_visits'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeliveryTracking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(db_index=True, max_length=80, unique=True)),
                ('rider_name', models.CharField(blank=True, max_length=120)),
                ('rider_phone', models.CharField(blank=True, max_length=40)),
                ('is_active', models.BooleanField(default=True)),
                ('started_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('stopped_at', models.DateTimeField(blank=True, null=True)),
                ('last_latitude', models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True)),
                ('last_longitude', models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True)),
                ('last_accuracy', models.FloatField(blank=True, null=True)),
                ('last_seen_at', models.DateTimeField(blank=True, null=True)),
                ('order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='delivery_tracking', to='restaurant.order')),
            ],
        ),
        migrations.CreateModel(
            name='DeliveryLocationPoint',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.DecimalField(decimal_places=7, max_digits=10)),
                ('longitude', models.DecimalField(decimal_places=7, max_digits=10)),
                ('accuracy', models.FloatField(blank=True, null=True)),
                ('speed', models.FloatField(blank=True, null=True)),
                ('heading', models.FloatField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('tracking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='points', to='restaurant.deliverytracking')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
