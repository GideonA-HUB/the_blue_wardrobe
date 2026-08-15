from django.db import migrations, models


def seed_featured_flags(apps, schema_editor):
    """
    Existing catalogue dresses (non-preorder) become featured so the homepage
    Featured Designs section does not go empty after deploy. Preorders stay
    Atelier-only (is_featured=False).
    """
    Design = apps.get_model('store', 'Design')
    Design.objects.filter(is_preorder=False).update(is_featured=True)
    Design.objects.filter(is_preorder=True).update(is_featured=False)


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0031_alter_order_delivery_fee'),
    ]

    operations = [
        migrations.AddField(
            model_name='design',
            name='is_featured',
            field=models.BooleanField(
                default=False,
                help_text='Show this dress in the Featured Designs section on the homepage (not for Atelier Reserve preorders)',
            ),
        ),
        migrations.RunPython(seed_featured_flags, migrations.RunPython.noop),
    ]
