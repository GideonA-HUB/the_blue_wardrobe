from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.conf import settings
import requests
import resend

from .models import (
    Collection, Design, SiteAsset, ContactMessage, Subscriber, Order,
    Customer, OrderItem, PaymentLog, Video, InfoCard, Material
)
from .serializers import (
    CollectionSerializer, DesignSerializer, SiteAssetSerializer,
    ContactMessageSerializer, SubscriberSerializer, OrderSerializer,
    VideoSerializer, InfoCardSerializer, MaterialSerializer, CustomerSerializer
)


class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Collection.objects.prefetch_related('materials', 'designs').all()
    serializer_class = CollectionSerializer


class DesignViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Design.objects.all()
    serializer_class = DesignSerializer


class SiteAssetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SiteAsset.objects.all()
    serializer_class = SiteAssetSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Video.objects.all().order_by('order', '-created_at')
    serializer_class = VideoSerializer


class InfoCardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InfoCard.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = InfoCardSerializer


# Admin viewsets with full CRUD
class AdminCollectionViewSet(viewsets.ModelViewSet):
    queryset = Collection.objects.prefetch_related('materials', 'designs').all()
    serializer_class = CollectionSerializer
    permission_classes = [IsAdminUser]


class AdminDesignViewSet(viewsets.ModelViewSet):
    queryset = Design.objects.all()
    serializer_class = DesignSerializer
    permission_classes = [IsAdminUser]


class AdminVideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by('order', '-created_at')
    serializer_class = VideoSerializer
    permission_classes = [IsAdminUser]


class AdminInfoCardViewSet(viewsets.ModelViewSet):
    queryset = InfoCard.objects.all().order_by('order', '-created_at')
    serializer_class = InfoCardSerializer
    permission_classes = [IsAdminUser]


class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer').prefetch_related('items__design').all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]


class AdminContactMessageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser]


class AdminSubscriberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subscriber.objects.all().order_by('-subscribed_at')
    serializer_class = SubscriberSerializer
    permission_classes = [IsAdminUser]


class AdminMaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAdminUser]


class AdminCustomerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminUser]


@api_view(['POST'])
def subscribe(request):
    serializer = SubscriberSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def contact(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def initiate_paystack(request):
    """
    Expecting payload: {email, amount, metadata: {cart, customer_info}}
    Returns Paystack authorization_url to redirect the user.
    """
    data = request.data
    email = data.get('email')
    amount = int(float(data.get('amount', 0)) * 100)  # in kobo
    metadata = data.get('metadata', {})

    headers = {
        'Authorization': f'Bearer {settings.PAYSTACK_SECRET}',
        'Content-Type': 'application/json',
    }
    payload = {
        'email': email,
        'amount': amount,
        'metadata': metadata,
    }
    resp = requests.post('https://api.paystack.co/transaction/initialize', json=payload, headers=headers)
    if resp.status_code != 200:
        return Response({'detail': 'Failed to contact payment gateway'}, status=status.HTTP_502_BAD_GATEWAY)
    return Response(resp.json())


@api_view(['POST'])
def verify_paystack(request):
    reference = request.data.get('reference')
    if not reference:
        return Response({'detail': 'reference required'}, status=status.HTTP_400_BAD_REQUEST)
    headers = {'Authorization': f'Bearer {settings.PAYSTACK_SECRET}'}
    resp = requests.get(f'https://api.paystack.co/transaction/verify/{reference}', headers=headers)
    if resp.status_code != 200:
        return Response({'detail': 'verification failed'}, status=status.HTTP_502_BAD_GATEWAY)

    payload = resp.json()
    data = payload.get('data') or {}
    status_str = data.get('status')
    amount_kobo = data.get('amount') or 0
    amount = (amount_kobo or 0) / 100
    metadata = data.get('metadata') or {}
    customer_email = (data.get('customer') or {}).get('email') or metadata.get('email')
    customer_meta = metadata.get('customer') or {}
    cart = metadata.get('cart') or []

    if status_str != 'success':
        # Log failed payment attempt
        PaymentLog.objects.create(
            reference=reference,
            status=status_str or 'failed',
            amount=amount,
            raw_response=payload,
        )
        return Response({'detail': 'payment not successful', 'status': status_str}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        customer, _ = Customer.objects.get_or_create(
            email=customer_email,
            defaults={
                'first_name': customer_meta.get('firstName', ''),
                'last_name': customer_meta.get('lastName', ''),
                'phone': metadata.get('phone', ''),
            },
        )

        order = Order.objects.create(
            customer=customer,
            total_amount=amount,
            status='confirmed',
            paystack_reference=reference,
        )

        # Create order items and adjust inventory
        for item in cart:
            design_id = item.get('id')
            size = item.get('size') or ''
            qty = int(item.get('qty') or 1)
            design = Design.objects.filter(id=design_id).select_for_update().first()
            if not design:
                continue
            unit_price = design.price
            OrderItem.objects.create(
                order=order,
                design=design,
                size=size,
                quantity=qty,
                unit_price=unit_price,
            )
            # basic inventory tracking
            if design.stock is not None:
                design.stock = max(0, design.stock - qty)
                design.save(update_fields=['stock'])

        PaymentLog.objects.create(
            order=order,
            reference=reference,
            status=status_str,
            amount=amount,
            raw_response=payload,
            paid_at=timezone.now(),
        )

    # Fire-and-forget notifications via Resend / webhook
    try:
        if settings.RESEND_API_KEY and customer_email:
            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": f"THE BLUE WARDROBE <no-reply@bluewardrobe.luxury>",
                "to": [customer_email],
                "subject": "Your order with THE BLUE WARDROBE",
                "html": f"<p>Thank you for your purchase.</p><p>Order #{order.id} — NGN {order.total_amount}</p>",
            })

        owner_email = getattr(settings, 'OWNER_EMAIL', '')
        if settings.RESEND_API_KEY and owner_email:
            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": f"THE BLUE WARDROBE <no-reply@bluewardrobe.luxury>",
                "to": [owner_email],
                "subject": "New order placed",
                "html": f"<p>New order #{order.id}</p><p>Total: NGN {order.total_amount}</p>",
            })

        if getattr(settings, 'OWNER_NOTIFICATION_WEBHOOK', ''):
            try:
                requests.post(settings.OWNER_NOTIFICATION_WEBHOOK, json={
                    "type": "order_created",
                    "order_id": order.id,
                    "total": float(order.total_amount),
                    "reference": reference,
                }, timeout=3)
            except Exception:
                # Do not fail purchase flow on webhook errors
                pass
    except Exception:
        # Email/notification failures should not break the API response
        pass

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_metrics(request):
    """
    Enhanced metrics endpoint for the owner dashboard with chart data.
    """
    from django.utils import timezone as dj_tz
    from django.db.models import Sum, Count
    from datetime import timedelta

    now = dj_tz.now()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_week = start_of_day - timedelta(days=start_of_day.weekday())
    start_of_month = start_of_day.replace(day=1)

    def range_sum(qs):
        return qs.aggregate(total=Sum('total_amount'))['total'] or 0

    confirmed = Order.objects.filter(status__in=['confirmed', 'shipped', 'delivered'])
    all_orders = Order.objects.all()

    # Daily sales for last 7 days (bar chart)
    daily_sales_data = []
    for i in range(6, -1, -1):
        day_start = (start_of_day - timedelta(days=i))
        day_end = day_start + timedelta(days=1)
        day_sales = range_sum(confirmed.filter(created_at__gte=day_start, created_at__lt=day_end))
        daily_sales_data.append({
            'date': day_start.strftime('%Y-%m-%d'),
            'day': day_start.strftime('%a'),
            'sales': float(day_sales),
        })

    # Order status distribution (pie chart)
    status_counts = all_orders.values('status').annotate(count=Count('id'))
    status_data = [{'status': item['status'], 'count': item['count']} for item in status_counts]

    # Monthly sales for last 6 months
    monthly_sales_data = []
    for i in range(5, -1, -1):
        month_start = (start_of_month - timedelta(days=30*i)).replace(day=1)
        if i == 0:
            month_end = now
        else:
            month_end = (month_start + timedelta(days=32)).replace(day=1)
        month_sales = range_sum(confirmed.filter(created_at__gte=month_start, created_at__lt=month_end))
        monthly_sales_data.append({
            'month': month_start.strftime('%b %Y'),
            'sales': float(month_sales),
        })

    data = {
        "total_sales": float(range_sum(confirmed)),
        "total_orders": confirmed.count(),
        "daily_sales": float(range_sum(confirmed.filter(created_at__gte=start_of_day))),
        "weekly_sales": float(range_sum(confirmed.filter(created_at__gte=start_of_week))),
        "monthly_sales": float(range_sum(confirmed.filter(created_at__gte=start_of_month))),
        "daily_sales_chart": daily_sales_data,
        "monthly_sales_chart": monthly_sales_data,
        "order_status_chart": status_data,
        "total_customers": Customer.objects.count(),
        "total_subscribers": Subscriber.objects.count(),
        "total_contact_messages": ContactMessage.objects.count(),
        "total_collections": Collection.objects.count(),
        "total_designs": Design.objects.count(),
    }
    return Response(data)


@api_view(['GET'])
def health(request):
    return Response({'status': 'ok'})
