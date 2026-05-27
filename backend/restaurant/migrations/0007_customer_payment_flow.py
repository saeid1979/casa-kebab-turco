from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0006_cashier_payment_profit'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='bank_transaction_id',
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(choices=[('cash_delivery', 'Cash on delivery'), ('card_delivery', 'Card terminal on delivery'), ('online_card', 'Online card payment')], default='cash_delivery', max_length=30),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_reference',
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_status',
            field=models.CharField(choices=[('pending', 'Pending'), ('pay_on_delivery', 'Pay on delivery'), ('paid', 'Paid'), ('failed', 'Failed'), ('cancelled', 'Cancelled')], default='pending', max_length=30),
        ),
        migrations.CreateModel(
            name='OnlinePaymentAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('provider', models.CharField(default='bbva_redsys_ready', max_length=40)),
                ('amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('status', models.CharField(choices=[('created', 'Created'), ('redirected', 'Redirected'), ('paid', 'Paid'), ('failed', 'Failed')], default='created', max_length=20)),
                ('reference', models.CharField(max_length=120, unique=True)),
                ('bank_response_code', models.CharField(blank=True, max_length=40)),
                ('bank_transaction_id', models.CharField(blank=True, max_length=120)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('confirmed_at', models.DateTimeField(blank=True, null=True)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_attempts', to='restaurant.order')),
            ],
        ),
    ]
