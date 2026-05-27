from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0005_user_profile_roles'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CashRegisterSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('opening_cash', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('closing_cash', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('expected_cash', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('difference', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('notes', models.TextField(blank=True)),
                ('opened_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('closed_at', models.DateTimeField(blank=True, null=True)),
                ('is_closed', models.BooleanField(default=False)),
                ('opened_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cash_sessions', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('method', models.CharField(choices=[('cash', 'Cash'), ('card', 'Card'), ('debt', 'Debt'), ('mixed', 'Mixed')], default='cash', max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('discount_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('debt_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='restaurant.order')),
            ],
        ),
    ]
