from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0029_international_delivery_settings'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='design',
            options={'ordering': ['-created_at', '-id']},
        ),
    ]
