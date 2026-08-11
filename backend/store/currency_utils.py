"""
FX conversion for NGN catalogue prices → USD/GBP display and Flutterwave checkout.
Rates and delivery fees are configured in StoreCurrencySettings (singleton).
"""
from __future__ import annotations

from decimal import Decimal
from typing import Any

ALLOWED_CHARGE_CURRENCIES = frozenset({"NGN", "USD", "GBP"})
ALLOWED_INTERNATIONAL_REGIONS = frozenset({"US", "UK", "CA"})

REGION_COUNTRY_LABELS = {
    "US": "United States",
    "UK": "United Kingdom",
    "CA": "Canada",
}


def get_fx_for_serializer_context() -> dict[str, float]:
    from .models import StoreCurrencySettings

    s = StoreCurrencySettings.get_solo()
    return {
        "ngn_per_usd": float(s.ngn_per_usd),
        "ngn_per_gbp": float(s.ngn_per_gbp),
        "ngn_per_cad": float(s.ngn_per_cad),
    }


def public_fx_dict() -> dict[str, str]:
    from .models import StoreCurrencySettings

    s = StoreCurrencySettings.get_solo()
    return {
        "ngn_per_usd": str(s.ngn_per_usd),
        "ngn_per_gbp": str(s.ngn_per_gbp),
        "ngn_per_cad": str(s.ngn_per_cad),
        "local_delivery_fee": str(s.local_delivery_fee),
        "international_delivery_fee": str(s.international_delivery_fee),
    }


def convert_from_ngn(amount_ngn: Decimal, currency: str) -> Decimal:
    c = (currency or "NGN").upper()
    if c == "NGN":
        return Decimal(amount_ngn).quantize(Decimal("0.01"))
    from .models import StoreCurrencySettings

    s = StoreCurrencySettings.get_solo()
    if c == "USD":
        divisor = s.ngn_per_usd
    elif c == "GBP":
        divisor = s.ngn_per_gbp
    elif c == "CAD":
        divisor = s.ngn_per_cad
    else:
        raise ValueError(f"Unsupported currency: {currency}")
    if divisor <= 0:
        raise ValueError("Invalid FX divisor")
    return (Decimal(amount_ngn) / Decimal(divisor)).quantize(Decimal("0.01"))


def cart_total_ngn(cart_lines: list[dict[str, Any]]) -> Decimal:
    """Sum catalogue (NGN) line totals from cart metadata [{id, size, qty}, ...]."""
    from .models import Design

    total = Decimal("0")
    for item in cart_lines:
        design_id = item.get("id")
        qty = int(item.get("qty") or 1)
        if not design_id:
            continue
        design = Design.objects.filter(id=design_id).first()
        if not design:
            continue
        total += Decimal(str(design.effective_price)) * qty
    return total.quantize(Decimal("0.01"))


def resolve_delivery_from_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    """
    Derive delivery_type, region, country, and NGN delivery fee from checkout metadata
    + StoreCurrencySettings.
    """
    from .models import StoreCurrencySettings

    meta = metadata or {}
    is_intl = bool(
        meta.get("isInternationalDelivery")
        or meta.get("is_international_delivery")
        or meta.get("internationalDelivery")
    )
    region_raw = (
        meta.get("internationalRegion")
        or meta.get("international_region")
        or ""
    )
    region = str(region_raw).strip().upper()
    if region == "CANADA":
        region = "CA"
    if region not in ALLOWED_INTERNATIONAL_REGIONS:
        region = ""

    settings_obj = StoreCurrencySettings.get_solo()
    if is_intl:
        fee = Decimal(str(settings_obj.international_delivery_fee)).quantize(Decimal("0.01"))
        country = REGION_COUNTRY_LABELS.get(region, "International")
        return {
            "delivery_type": "international",
            "international_region": region,
            "country": country,
            "delivery_fee_ngn": fee,
            "is_international": True,
        }

    fee = Decimal(str(settings_obj.local_delivery_fee)).quantize(Decimal("0.01"))
    return {
        "delivery_type": "local",
        "international_region": "",
        "country": "Nigeria",
        "delivery_fee_ngn": fee,
        "is_international": False,
    }
