from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0025_homepage_hero_atelier_slides'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='delivery_address',
            field=models.TextField(blank=True, default=''),
        ),
    ]
