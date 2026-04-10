"""
Shared payment completion logic (Paystack + Flutterwave).
Cart line items use SizeMeasurement — the same model the storefront cart uses for stock.
"""
from __future__ import annotations

import json
import logging
from decimal import Decimal
from typing import Any

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .email_utils import (
    order_confirmation_customer_html,
    order_notification_owner_html,
)
from .models import (
    Customer,
    Design,
    Order,
    OrderItem,
    PaymentLog,
    SizeMeasurement,
)

logger = logging.getLogger(__name__)


def get_resend_client():
    try:
        from importlib import import_module

        return import_module("resend")
    except Exception:
        return None


def _resend_from() -> str:
    return getattr(settings, "RESEND_FROM_EMAIL", None) or "THE BLUE WARDROBE <no-reply@bluewardrobe.luxury>"


def _phone_from_meta(metadata: dict, customer_meta: dict) -> str:
    return (metadata.get("phone") or customer_meta.get("phone") or "") or ""


def send_order_emails(order: Order, customer_email: str | None) -> None:
    """Customer + owner transactional emails via Resend (non-fatal on failure)."""
    resend_client = get_resend_client()
    if not settings.RESEND_API_KEY or not resend_client:
        return
    resend_client.api_key = settings.RESEND_API_KEY
    site = getattr(settings, "SITE_NAME", "THE BLUE WARDROBE")
    from_addr = _resend_from()
    try:
        if customer_email:
            resend_client.Emails.send(
                {
                    "from": from_addr,
                    "to": [customer_email],
                    "subject": f"Order confirmed — {site}",
                    "html": order_confirmation_customer_html(
                        order_id=order.id,
                        total=order.total_amount,
                        site_name=site,
                    ),
                }
            )
    except Exception as e:
        logger.warning("Resend customer order email failed: %s", e)

    owner_email = getattr(settings, "OWNER_EMAIL", "") or ""
    try:
        if owner_email:
            resend_client.Emails.send(
                {
                    "from": from_addr,
                    "to": [owner_email],
                    "subject": f"New order #{order.id} — {site}",
                    "html": order_notification_owner_html(
                        order_id=order.id,
                        total=order.total_amount,
                        customer_email=customer_email or "",
                        site_name=site,
                    ),
                }
            )
    except Exception as e:
        logger.warning("Resend owner order email failed: %s", e)

    if getattr(settings, "OWNER_NOTIFICATION_WEBHOOK", ""):
        try:
            requests.post(
                settings.OWNER_NOTIFICATION_WEBHOOK,
                json={
                    "type": "order_created",
                    "order_id": order.id,
                    "total": float(order.total_amount),
                },
                timeout=3,
            )
        except Exception:
            pass


def _existing_success_order(gateway: str, reference: str) -> Order | None:
    """Match by reference; require gateway match only when the log row has gateway set (older rows may be blank)."""
    log = (
        PaymentLog.objects.filter(reference=reference)
        .select_related("order")
        .order_by("-created_at")
        .first()
    )
    if not log or not log.order_id:
        return None
    if log.status.lower() not in ("success", "successful"):
        return None
    if log.gateway and log.gateway != gateway:
        return None
    return log.order


@transaction.atomic
def finalize_order_from_cart(
    *,
    gateway: str,
    reference: str,
    amount: Decimal | float,
    status_str: str,
    raw_payload: dict[str, Any],
    customer_email: str | None,
    cart: list[dict[str, Any]],
    customer_meta: dict[str, Any],
    metadata: dict[str, Any],
    paystack_reference: str = "",
    flutterwave_tx_ref: str = "",
) -> tuple[Order, bool]:
    """
    Create order + line items, decrement SizeMeasurement stock, log payment.
    Idempotent per (gateway, reference) when a successful log already exists.
    Returns (order, created_new).
    """
    existing = _existing_success_order(gateway, reference)
    if existing:
        return existing, False

    phone = _phone_from_meta(metadata, customer_meta)

    customer, _ = Customer.objects.get_or_create(
        email=customer_email or "",
        defaults={
            "first_name": customer_meta.get("firstName", ""),
            "last_name": customer_meta.get("lastName", ""),
            "phone": phone,
        },
    )

    order = Order.objects.create(
        customer=customer,
        total_amount=Decimal(str(amount)).quantize(Decimal("0.01")),
        status="confirmed",
        payment_provider=gateway,
        paystack_reference=paystack_reference or "",
        flutterwave_tx_ref=flutterwave_tx_ref or "",
    )

    for item in cart:
        design_id = item.get("id")
        size = item.get("size")
        qty = int(item.get("qty") or 1)
        design = Design.objects.filter(id=design_id).select_for_update().first()
        if not design:
            continue

        size_measurement = (
            SizeMeasurement.objects.filter(
                design=design, size=size, is_active=True
            )
            .select_for_update()
            .first()
        )

        if not size_measurement or size_measurement.stock < qty:
            continue

        unit_price = design.effective_price
        OrderItem.objects.create(
            order=order,
            design=design,
            size=size,
            quantity=qty,
            unit_price=unit_price,
        )

        size_measurement.stock = max(0, size_measurement.stock - qty)
        size_measurement.save(update_fields=["stock"])

    PaymentLog.objects.create(
        order=order,
        gateway=gateway,
        reference=reference,
        status=status_str,
        amount=order.total_amount,
        raw_response=raw_payload,
        paid_at=timezone.now(),
    )

    return order, True


def parse_flutterwave_meta(data: dict[str, Any]) -> dict[str, Any]:
    """Recover our cart/customer payload from Flutterwave transaction meta."""
    raw = data.get("meta")
    if raw is None:
        return {}
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}
    if isinstance(raw, dict):
        inner = raw.get("tbw_metadata")
        if isinstance(inner, str):
            try:
                return json.loads(inner)
            except json.JSONDecodeError:
                return {}
        if inner and isinstance(inner, dict):
            return inner
        return raw
    if isinstance(raw, list):
        for entry in raw:
            if not isinstance(entry, dict):
                continue
            if entry.get("metaname") == "tbw_metadata":
                mv = entry.get("metavalue")
                if isinstance(mv, str):
                    try:
                        return json.loads(mv)
                    except json.JSONDecodeError:
                        return {}
        return {}
    return {}
