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

from .currency_utils import cart_total_ngn, convert_from_ngn
from .email_utils import (
    order_confirmation_customer_html,
    order_items_from_order,
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
    return (
        getattr(settings, "RESEND_FROM_EMAIL", None)
        or "THE BLUE WARDROBE <orders@thebluewardrobe.ng>"
    )


def _owner_recipient_list() -> list[str]:
    """OWNER_EMAIL and/or comma-separated OWNER_EMAILS."""
    raw = (getattr(settings, "OWNER_EMAILS", None) or "").strip()
    if not raw:
        raw = (getattr(settings, "OWNER_EMAIL", None) or "").strip()
    parts = [p.strip() for p in raw.replace(";", ",").split(",") if p.strip()]
    return parts


def _send_resend_email(*, resend_client, params: dict[str, Any], label: str) -> bool:
    try:
        result = resend_client.Emails.send(params)
        email_id = None
        if isinstance(result, dict):
            email_id = result.get("id")
        elif hasattr(result, "id"):
            email_id = getattr(result, "id", None)
        logger.info("Resend %s sent successfully (id=%s)", label, email_id)
        return True
    except Exception as e:
        logger.error("Resend %s failed: %s", label, e, exc_info=True)
        return False


def _phone_from_meta(metadata: dict, customer_meta: dict) -> str:
    return (metadata.get("phone") or customer_meta.get("phone") or "") or ""


def _delivery_from_meta(metadata: dict[str, Any]) -> str:
    for key in ("deliveryAddress", "delivery_address", "delivery", "address"):
        v = metadata.get(key)
        if isinstance(v, str) and v.strip():
            return v.strip()
    return ""


def send_order_emails(order: Order, customer_email: str | None) -> None:
    """Customer + owner transactional emails via Resend (non-fatal on failure)."""
    resend_client = get_resend_client()
    if not settings.RESEND_API_KEY:
        logger.warning(
            "Order #%s: RESEND_API_KEY is not set — skipping order emails.",
            order.id,
        )
        return
    if not resend_client:
        logger.warning(
            "Order #%s: resend package not available — run pip install resend.",
            order.id,
        )
        return

    resend_client.api_key = settings.RESEND_API_KEY
    site = getattr(settings, "SITE_NAME", "THE BLUE WARDROBE")
    from_addr = _resend_from()
    reply_to = (getattr(settings, "RESEND_REPLY_TO", None) or "").strip() or None

    order = (
        Order.objects.select_related("customer")
        .prefetch_related("items__design")
        .get(pk=order.pk)
    )
    pay_ccy = (getattr(order, "currency", None) or "NGN").upper()
    line_items = order_items_from_order(order)
    customer = order.customer
    customer_name = ""
    customer_phone = ""
    if customer:
        customer_name = f"{customer.first_name} {customer.last_name}".strip()
        customer_phone = customer.phone or ""

    payment_ref = order.flutterwave_tx_ref or order.paystack_reference or ""
    delivery = order.delivery_address or ""

    if customer_email:
        params: dict[str, Any] = {
            "from": from_addr,
            "to": [customer_email],
            "subject": f"Your order #{order.id} is confirmed — {site}",
            "html": order_confirmation_customer_html(
                order_id=order.id,
                total=order.total_amount,
                currency=pay_ccy,
                site_name=site,
                customer_name=customer_name,
                line_items=line_items,
                delivery_address=delivery,
            ),
        }
        if reply_to:
            params["reply_to"] = reply_to
        _send_resend_email(resend_client=resend_client, params=params, label=f"customer order #{order.id}")
    else:
        logger.warning("Order #%s: no customer email — skipping customer confirmation.", order.id)

    owner_recipients = _owner_recipient_list()
    if owner_recipients:
        owner_params: dict[str, Any] = {
            "from": from_addr,
            "to": owner_recipients,
            "subject": f"New order #{order.id} — {site}",
            "html": order_notification_owner_html(
                order_id=order.id,
                total=order.total_amount,
                customer_email=customer_email or (customer.email if customer else ""),
                currency=pay_ccy,
                site_name=site,
                customer_name=customer_name,
                customer_phone=customer_phone,
                delivery_address=delivery,
                line_items=line_items,
                payment_provider=order.payment_provider or "",
                payment_reference=payment_ref,
                total_ngn_equivalent=order.total_ngn_equivalent,
            ),
        }
        if reply_to:
            owner_params["reply_to"] = reply_to
        _send_resend_email(
            resend_client=resend_client,
            params=owner_params,
            label=f"owner order #{order.id}",
        )
    else:
        logger.warning(
            "Order #%s: OWNER_EMAIL is not set in Railway — owner will not receive email alerts.",
            order.id,
        )

    webhook = (getattr(settings, "OWNER_NOTIFICATION_WEBHOOK", None) or "").strip()
    if webhook:
        try:
            requests.post(
                webhook,
                json={
                    "type": "order_created",
                    "order_id": order.id,
                    "total": float(order.total_amount),
                    "currency": pay_ccy,
                    "customer_email": customer_email,
                },
                timeout=5,
            )
        except Exception as e:
            logger.warning("Owner notification webhook failed: %s", e)


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
    charge_currency: str | None = None,
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
    # Keep customer profile fresh for fulfillment contacts.
    updated_fields: list[str] = []
    first_name = (customer_meta.get("firstName") or "").strip()
    last_name = (customer_meta.get("lastName") or "").strip()
    if first_name and customer.first_name != first_name:
        customer.first_name = first_name
        updated_fields.append("first_name")
    if last_name and customer.last_name != last_name:
        customer.last_name = last_name
        updated_fields.append("last_name")
    if phone and customer.phone != phone:
        customer.phone = phone
        updated_fields.append("phone")
    if updated_fields:
        customer.save(update_fields=updated_fields)

    delivery_address = _delivery_from_meta(metadata)

    pay_currency = (charge_currency or metadata.get("payCurrency") or "NGN").upper()
    if pay_currency not in ("NGN", "USD", "GBP"):
        pay_currency = "NGN"

    total_ngn_equivalent = cart_total_ngn(cart)

    order = Order.objects.create(
        customer=customer,
        delivery_address=delivery_address,
        currency=pay_currency,
        total_amount=Decimal(str(amount)).quantize(Decimal("0.01")),
        total_ngn_equivalent=total_ngn_equivalent,
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

        unit_price_ngn = Decimal(str(design.effective_price))
        unit_price = convert_from_ngn(unit_price_ngn, pay_currency)
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
        currency=pay_currency,
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
            parsed = json.loads(raw)
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}
    if isinstance(raw, dict):
        inner = raw.get("tbw_metadata")
        if isinstance(inner, str):
            try:
                parsed = json.loads(inner)
                return parsed if isinstance(parsed, dict) else {}
            except json.JSONDecodeError:
                return {}
        if inner and isinstance(inner, dict):
            return inner
        return raw if raw else {}
    if isinstance(raw, list):
        merged: dict[str, Any] = {}
        for entry in raw:
            if not isinstance(entry, dict):
                continue
            mv = entry.get("metavalue")
            if isinstance(mv, dict):
                merged.update(mv)
                continue
            if not isinstance(mv, str):
                continue
            try:
                obj = json.loads(mv)
            except json.JSONDecodeError:
                continue
            if isinstance(obj, dict):
                merged.update(obj)
        return merged
    return {}
