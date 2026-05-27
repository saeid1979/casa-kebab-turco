from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0009_customer_user_account'),
    ]

    operations = [
        migrations.CreateModel(
            name='ComingSoonVisit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('country', models.CharField(blank=True, max_length=120)),
                ('country_code', models.CharField(blank=True, max_length=20)),
                ('city', models.CharField(blank=True, max_length=120)),
                ('region', models.CharField(blank=True, max_length=120)),
                ('timezone', models.CharField(blank=True, max_length=120)),
                ('isp', models.CharField(blank=True, max_length=200)),
                ('user_agent', models.TextField(blank=True)),
                ('browser_language', models.CharField(blank=True, max_length=80)),
                ('page_url', models.TextField(blank=True)),
                ('referrer', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
