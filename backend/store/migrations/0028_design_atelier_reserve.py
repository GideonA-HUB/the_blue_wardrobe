# Generated manually for Atelier Reserve (preorder) fields on Design

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0027_storecurrency_order_currency'),
    ]

    operations = [
        migrations.AddField(
            model_name='design',
            name='is_preorder',
            field=models.BooleanField(
                default=False,
                help_text='Atelier Reserve: allow customers to preorder this unreleased dress',
            ),
        ),
        migrations.AddField(
            model_name='design',
            name='preorder_start_at',
            field=models.DateTimeField(
                blank=True,
                help_text='When the preorder reservation window opens',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='design',
            name='preorder_end_at',
            field=models.DateTimeField(
                blank=True,
                help_text='When the preorder reservation window closes',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='design',
            name='preorder_wait_days',
            field=models.PositiveIntegerField(
                default=14,
                help_text='Estimated wait in days after the order is placed',
            ),
        ),
    ]
