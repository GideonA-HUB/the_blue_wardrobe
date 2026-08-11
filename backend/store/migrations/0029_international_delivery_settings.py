# Generated manually for international delivery + editable fees/FX

from decimal import Decimal

from django.db import migrations, models


def seed_delivery_defaults(apps, schema_editor):
    StoreCurrencySettings = apps.get_model("store", "StoreCurrencySettings")
    obj, _ = StoreCurrencySettings.objects.get_or_create(pk=1)
    updated = []
    if getattr(obj, "international_delivery_fee", None) in (None,):
        pass
    # Ensure defaults for existing singleton rows created before these fields
    if obj.local_delivery_fee is None:
        obj.local_delivery_fee = Decimal("0")
        updated.append("local_delivery_fee")
    if obj.international_delivery_fee is None:
        obj.international_delivery_fee = Decimal("102000.00")
        updated.append("international_delivery_fee")
    if obj.ngn_per_cad is None:
        obj.ngn_per_cad = Decimal("1120")
        updated.append("ngn_per_cad")
    if updated:
        obj.save(update_fields=updated)


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0028_design_atelier_reserve"),
    ]

    operations = [
        migrations.AddField(
            model_name="storecurrencysettings",
            name="ngn_per_cad",
            field=models.DecimalField(
                decimal_places=4,
                default=Decimal("1120"),
                help_text="NGN per 1 CAD (display only; payments stay NGN/USD/GBP)",
                max_digits=14,
            ),
        ),
        migrations.AddField(
            model_name="storecurrencysettings",
            name="local_delivery_fee",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("0"),
                help_text="Nigeria local delivery fee in NGN (0 = free)",
                max_digits=12,
            ),
        ),
        migrations.AddField(
            model_name="storecurrencysettings",
            name="international_delivery_fee",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("102000.00"),
                help_text="International delivery fee in NGN (US / UK / Canada)",
                max_digits=12,
            ),
        ),
        migrations.AlterModelOptions(
            name="storecurrencysettings",
            options={
                "verbose_name": "Store currency & delivery settings",
                "verbose_name_plural": "Store currency & delivery settings",
            },
        ),
        migrations.AddField(
            model_name="order",
            name="delivery_type",
            field=models.CharField(
                choices=[("local", "Local (Nigeria)"), ("international", "International")],
                default="local",
                help_text="Local Nigeria vs international shipping",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="international_region",
            field=models.CharField(
                blank=True,
                choices=[
                    ("", "—"),
                    ("US", "United States"),
                    ("UK", "United Kingdom"),
                    ("CA", "Canada"),
                ],
                default="",
                help_text="US / UK / CA when delivery is international",
                max_length=2,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="country",
            field=models.CharField(
                blank=True,
                default="Nigeria",
                help_text="Ship-to country label",
                max_length=64,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="subtotal",
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                help_text="Merchandise subtotal in charge currency (before delivery fee)",
                max_digits=12,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="delivery_fee",
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                help_text="Delivery fee charged (in charge currency; NGN equivalent also in totals)",
                max_digits=12,
            ),
        ),
        migrations.RunPython(seed_delivery_defaults, migrations.RunPython.noop),
    ]
