from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0002_menuitem_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='menuitem',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
