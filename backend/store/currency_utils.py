"""
FX conversion for NGN catalogue prices → USD/GBP display and Flutterwave checkout.
Rates are configured in StoreCurrencySettings (singleton).
"""
from __future__ import annotations

from decimal import Decimal
from typing import Any

ALLOWED_CHARGE_CURRENCIES = frozenset({"NGN", "USD", "GBP"})


def get_fx_for_serializer_context() -> dict[str, float]:
    from .models import StoreCurrencySettings

    s = StoreCurrencySettings.get_solo()
    return {"ngn_per_usd": float(s.ngn_per_usd), "ngn_per_gbp": float(s.ngn_per_gbp)}


def public_fx_dict() -> dict[str, str]:
    from .models import StoreCurrencySettings

    s = StoreCurrencySettings.get_solo()
    return {
        "ngn_per_usd": str(s.ngn_per_usd),
        "ngn_per_gbp": str(s.ngn_per_gbp),
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
