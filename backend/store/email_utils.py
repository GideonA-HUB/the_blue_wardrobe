"""
HTML email bodies for Resend (orders and newsletter).
"""
from __future__ import annotations

from decimal import Decimal


def order_confirmation_customer_html(
    *,
    order_id: int,
    total: Decimal | float,
    currency: str = "NGN",
    site_name: str = "THE BLUE WARDROBE",
) -> str:
    total_s = f"{total:,.2f}" if isinstance(total, Decimal) else f"{float(total):,.2f}"
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="padding:32px 28px 8px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">{site_name}</p>
          <h1 style="margin:12px 0 0;font-size:26px;font-weight:600;">Thank you for your order</h1>
        </td></tr>
        <tr><td style="padding:8px 28px 28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">
            We have received your payment and are preparing your order.
          </p>
          <table role="presentation" width="100%" style="background:#f8fafc;border-radius:8px;padding:20px;">
            <tr><td>
              <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Order number</p>
              <p style="margin:0 0 16px;font-size:20px;font-weight:600;">#{order_id}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Total</p>
              <p style="margin:0;font-size:22px;font-weight:600;">{currency} {total_s}</p>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#64748b;">
            You will receive updates when your order ships. If you have questions, reply to this email or contact us through our website.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def order_notification_owner_html(
    *,
    order_id: int,
    total: Decimal | float,
    customer_email: str,
    currency: str = "NGN",
    site_name: str = "THE BLUE WARDROBE",
) -> str:
    total_s = f"{total:,.2f}" if isinstance(total, Decimal) else f"{float(total):,.2f}"
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px;">
    <tr><td>
      <p style="margin:0 0 8px;font-size:12px;color:#64748b;">{site_name} — new order</p>
      <h2 style="margin:0 0 16px;">Order #{order_id}</h2>
      <p style="margin:0 0 8px;"><strong>Total:</strong> {currency} {total_s}</p>
      <p style="margin:0 0 8px;"><strong>Customer:</strong> {customer_email}</p>
      <p style="margin:16px 0 0;font-size:14px;color:#64748b;">Check your admin dashboard for line items and fulfillment.</p>
    </td></tr>
  </table>
</body>
</html>"""


def newsletter_welcome_html(*, site_name: str = "THE BLUE WARDROBE") -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;padding:32px 28px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td>
          <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">{site_name}</p>
          <h1 style="margin:12px 0 16px;font-size:24px;font-weight:600;">You are on the list</h1>
          <p style="margin:0;font-size:16px;line-height:1.6;color:#334155;">
            Thank you for subscribing. You will be the first to hear about new collections, private sales, and atelier updates.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
