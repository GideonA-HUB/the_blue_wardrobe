"""
HTML email bodies for Resend (orders and newsletter).
"""
from __future__ import annotations

import html
from decimal import Decimal
from typing import Any

from django.conf import settings


def _fmt_money(amount: Decimal | float, currency: str) -> str:
    cur = (currency or "NGN").upper()
    val = f"{amount:,.2f}" if isinstance(amount, Decimal) else f"{float(amount):,.2f}"
    return f"{cur} {val}"


def get_email_brand() -> dict[str, str]:
    """Logo URL and site links for transactional emails."""
    logo_url = (getattr(settings, "EMAIL_LOGO_URL", None) or "").strip()
    site_url = getattr(settings, "PUBLIC_SITE_URL", "https://www.thebluewardrobe.com").rstrip("/")
    site_name = getattr(settings, "SITE_NAME", "THE BLUE WARDROBE")

    if not logo_url:
        try:
            from .models import SiteAsset

            asset = SiteAsset.objects.filter(name="logo_primary").first()
            if asset and asset.file:
                raw = asset.file.url
                if isinstance(raw, str) and raw.startswith(("http://", "https://")):
                    logo_url = raw
                elif isinstance(raw, str) and raw:
                    logo_url = f"{site_url}{raw}" if raw.startswith("/") else f"{site_url}/{raw}"
        except Exception:
            logo_url = ""

    if not logo_url:
        logo_url = f"{site_url}/favicon.ico"

    return {
        "logo_url": logo_url,
        "site_url": site_url,
        "site_name": site_name,
    }


def _line_items_rows(items: list[dict[str, Any]], currency: str) -> str:
    rows = []
    for it in items:
        title = html.escape(str(it.get("title") or "Design"))
        size = html.escape(str(it.get("size") or ""))
        qty = int(it.get("quantity") or 1)
        unit = it.get("unit_price", 0)
        line_total = it.get("line_total")
        if line_total is None:
            line_total = float(unit) * qty
        rows.append(
            f"""<tr>
              <td style="padding:12px 0;border-bottom:1px solid #e8ecf1;font-size:14px;color:#1e293b;">
                <strong>{title}</strong><br>
                <span style="color:#64748b;font-size:12px;">Size {size}</span>
              </td>
              <td align="center" style="padding:12px 8px;border-bottom:1px solid #e8ecf1;font-size:14px;color:#334155;">{qty}</td>
              <td align="right" style="padding:12px 0;border-bottom:1px solid #e8ecf1;font-size:14px;color:#1e293b;white-space:nowrap;">
                {_fmt_money(line_total, currency)}
              </td>
            </tr>"""
        )
    if not rows:
        rows.append(
            '<tr><td colspan="3" style="padding:16px 0;color:#64748b;font-size:14px;">'
            "Line items will appear in your dashboard.</td></tr>"
        )
    return "".join(rows)


def _email_shell(
    *,
    preheader: str,
    headline: str,
    body_html: str,
    cta_label: str | None = None,
    cta_url: str | None = None,
) -> str:
    brand = get_email_brand()
    logo = html.escape(brand["logo_url"])
    site_name = html.escape(brand["site_name"])
    site_url = html.escape(brand["site_url"])
    pre = html.escape(preheader)
    head = html.escape(headline)

    cta_block = ""
    if cta_label and cta_url:
        cta_block = f"""
        <tr><td align="center" style="padding:8px 32px 32px;">
          <a href="{html.escape(cta_url)}"
             style="display:inline-block;background:#1e3a8a;color:#ffffff;text-decoration:none;
                    font-size:14px;font-weight:600;letter-spacing:0.04em;padding:14px 28px;border-radius:999px;">
            {html.escape(cta_label)}
          </a>
        </td></tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>{head}</title>
</head>
<body style="margin:0;padding:0;background:#eef1f6;font-family:Georgia,'Times New Roman',Times,serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{pre}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#eef1f6 0%,#f8fafc 100%);padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a 0%,#312e81 55%,#1e40af 100%);padding:28px 32px;text-align:center;">
            <a href="{site_url}" style="text-decoration:none;">
              <img src="{logo}" alt="{site_name}" width="88" height="88"
                   style="display:block;margin:0 auto 14px;border-radius:50%;border:3px solid rgba(255,255,255,0.35);background:#ffffff;object-fit:cover;" />
            </a>
            <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.85);">{site_name}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 8px;">
            <h1 style="margin:0;font-size:26px;font-weight:600;line-height:1.3;color:#0f172a;">{head}</h1>
          </td>
        </tr>
        <tr><td style="padding:0 32px 24px;font-size:16px;line-height:1.65;color:#334155;">
          {body_html}
        </td></tr>
        {cta_block}
        <tr>
          <td style="padding:24px 32px 32px;border-top:1px solid #e8ecf1;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;letter-spacing:0.06em;text-transform:uppercase;">The Dress Diaries</p>
            <p style="margin:0;font-size:13px;color:#64748b;">
              <a href="{site_url}" style="color:#1e40af;text-decoration:none;">{site_url.replace('https://','').replace('http://','')}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def order_items_from_order(order) -> list[dict[str, Any]]:
    items = []
    for row in order.items.select_related("design").all():
        qty = row.quantity
        unit = float(row.unit_price)
        items.append(
            {
                "title": row.design.title if row.design_id else "Design",
                "size": row.size,
                "quantity": qty,
                "unit_price": unit,
                "line_total": unit * qty,
            }
        )
    return items


def order_confirmation_customer_html(
    *,
    order_id: int,
    total: Decimal | float,
    currency: str = "NGN",
    site_name: str = "THE BLUE WARDROBE",
    customer_name: str = "",
    line_items: list[dict[str, Any]] | None = None,
    delivery_address: str = "",
) -> str:
    del site_name  # brand from settings
    cur = (currency or "NGN").upper()
    name_bit = f", {html.escape(customer_name)}" if customer_name else ""
    items_html = _line_items_rows(line_items or [], cur)
    addr_block = ""
    if delivery_address.strip():
        addr_block = f"""
        <p style="margin:20px 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Delivery address</p>
        <p style="margin:0;padding:14px 16px;background:#f8fafc;border-radius:10px;font-size:14px;line-height:1.5;color:#1e293b;white-space:pre-wrap;">{html.escape(delivery_address.strip())}</p>"""

    body = f"""
      <p style="margin:0 0 20px;">Dear customer{name_bit},</p>
      <p style="margin:0 0 24px;">Thank you for choosing us. Your payment was successful and we are preparing your order with care.</p>
      <table role="presentation" width="100%" style="background:#f8fafc;border-radius:12px;padding:20px 22px;margin-bottom:8px;">
        <tr><td>
          <p style="margin:0 0 6px;font-size:12px;color:#64748b;letter-spacing:0.06em;text-transform:uppercase;">Order number</p>
          <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1e3a8a;">#{order_id}</p>
          <p style="margin:0 0 6px;font-size:12px;color:#64748b;letter-spacing:0.06em;text-transform:uppercase;">Amount paid</p>
          <p style="margin:0;font-size:24px;font-weight:700;color:#0f172a;">{_fmt_money(total, cur)}</p>
        </td></tr>
      </table>
      {addr_block}
      <p style="margin:28px 0 12px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Your designs</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:2px solid #e8ecf1;">
        <tr>
          <th align="left" style="padding:10px 0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">Item</th>
          <th align="center" style="padding:10px 8px;font-size:11px;color:#94a3b8;text-transform:uppercase;">Qty</th>
          <th align="right" style="padding:10px 0;font-size:11px;color:#94a3b8;text-transform:uppercase;">Total</th>
        </tr>
        {items_html}
      </table>
      <p style="margin:24px 0 0;font-size:14px;color:#64748b;">We will contact you when your order ships. Questions? Reply to this email.</p>
    """
    brand = get_email_brand()
    return _email_shell(
        preheader=f"Order #{order_id} confirmed — {_fmt_money(total, cur)}",
        headline="Your order is confirmed",
        body_html=body,
        cta_label="Visit our boutique",
        cta_url=brand["site_url"],
    )


def order_notification_owner_html(
    *,
    order_id: int,
    total: Decimal | float,
    customer_email: str,
    currency: str = "NGN",
    site_name: str = "THE BLUE WARDROBE",
    customer_name: str = "",
    customer_phone: str = "",
    delivery_address: str = "",
    line_items: list[dict[str, Any]] | None = None,
    payment_provider: str = "",
    payment_reference: str = "",
    total_ngn_equivalent: Decimal | float | None = None,
) -> str:
    del site_name
    cur = (currency or "NGN").upper()
    items_html = _line_items_rows(line_items or [], cur)
    ngn_note = ""
    if total_ngn_equivalent is not None and cur != "NGN":
        ngn_note = f'<p style="margin:8px 0 0;font-size:13px;color:#64748b;">NGN equivalent: {_fmt_money(total_ngn_equivalent, "NGN")}</p>'

    body = f"""
      <p style="margin:0 0 20px;"><strong>New paid order</strong> — action required for fulfillment.</p>
      <table role="presentation" width="100%" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:12px;color:#9a3412;text-transform:uppercase;letter-spacing:0.06em;">Order #{order_id}</p>
          <p style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">{_fmt_money(total, cur)}</p>
          {ngn_note}
        </td></tr>
      </table>
      <table role="presentation" width="100%" style="margin-bottom:20px;">
        <tr><td style="padding:8px 0;font-size:14px;"><span style="color:#64748b;">Customer</span><br><strong>{html.escape(customer_name or "—")}</strong></td></tr>
        <tr><td style="padding:8px 0;font-size:14px;"><span style="color:#64748b;">Email</span><br><a href="mailto:{html.escape(customer_email)}" style="color:#1e40af;">{html.escape(customer_email or "—")}</a></td></tr>
        <tr><td style="padding:8px 0;font-size:14px;"><span style="color:#64748b;">Phone</span><br><strong>{html.escape(customer_phone or "—")}</strong></td></tr>
        <tr><td style="padding:8px 0;font-size:14px;"><span style="color:#64748b;">Payment</span><br><strong>{html.escape(payment_provider or "—")}</strong>
          {f'<br><span style="font-size:12px;color:#64748b;word-break:break-all;">{html.escape(payment_reference)}</span>' if payment_reference else ""}
        </td></tr>
        <tr><td style="padding:8px 0;font-size:14px;"><span style="color:#64748b;">Delivery address</span><br>
          <span style="white-space:pre-wrap;">{html.escape(delivery_address.strip() or "Not provided")}</span></td></tr>
      </table>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <th align="left" style="padding:10px 0;font-size:11px;color:#94a3b8;text-transform:uppercase;">Item</th>
          <th align="center" style="padding:10px 8px;font-size:11px;color:#94a3b8;text-transform:uppercase;">Qty</th>
          <th align="right" style="padding:10px 0;font-size:11px;color:#94a3b8;text-transform:uppercase;">Total</th>
        </tr>
        {items_html}
      </table>
    """
    brand = get_email_brand()
    owner_url = f"{brand['site_url']}/owner/"
    return _email_shell(
        preheader=f"New order #{order_id} from {customer_email}",
        headline="New customer order",
        body_html=body,
        cta_label="Open owner dashboard",
        cta_url=owner_url,
    )


def newsletter_welcome_html(*, site_name: str = "THE BLUE WARDROBE") -> str:
    body = f"""
      <p style="margin:0;">Thank you for subscribing to <strong>{html.escape(site_name)}</strong>.</p>
      <p style="margin:20px 0 0;">You will be first to hear about new Dress Diaries, private sales, and atelier stories.</p>
    """
    brand = get_email_brand()
    return _email_shell(
        preheader="You are on our list",
        headline="Welcome to the list",
        body_html=body,
        cta_label="Explore collections",
        cta_url=f"{brand['site_url']}/collections",
    )
