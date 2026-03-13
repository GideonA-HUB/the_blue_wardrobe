from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes, action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from importlib import import_module
import requests
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .models import (
    Collection, Design, DesignImage, SizeInventory, Cart, CartItem, SiteAsset, ContactMessage, Subscriber, Order,
    Customer, OrderItem, PaymentLog, Video, InfoCard, Material
)
from .serializers import (
    CollectionSerializer, DesignSerializer, SiteAssetSerializer,
    ContactMessageSerializer, SubscriberSerializer, OrderSerializer,
    VideoSerializer, InfoCardSerializer, MaterialSerializer, CustomerSerializer,
    CartSerializer, CartItemSerializer
)


def get_resend_client():
    try:
        return import_module('resend')
    except Exception:
        return None


class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CollectionSerializer

    def get_queryset(self):
        queryset = Collection.objects.prefetch_related('materials', 'designs').all().order_by('order', 'code', '-created_at')
        featured = (self.request.query_params.get('featured') or '').strip().lower()
        if featured in {'1', 'true', 'yes'}:
            queryset = queryset.filter(is_featured=True)
        return queryset


class DesignViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Design.objects.prefetch_related('images', 'size_inventory').all()
    serializer_class = DesignSerializer


@method_decorator(csrf_exempt, name='dispatch')
class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    
    def get_queryset(self):
        session_id = self.request.session.session_key or self.request.META.get('HTTP_X_SESSION_ID')
        if not session_id:
            return Cart.objects.none()
        return Cart.objects.prefetch_related('items__design').filter(session_id=session_id)
    
    def get_object(self):
        session_id = self.request.session.session_key or self.request.META.get('HTTP_X_SESSION_ID')
        print(f"Initial session_id: {session_id}")
        print(f"Session exists: {self.request.session.exists(self.request.session.session_key) if self.request.session.session_key else False}")
        
        if not session_id:
            # Create session if it doesn't exist
            if not self.request.session.session_key:
                self.request.session.create()
                # Ensure session is saved
                self.request.session.save()
            session_id = self.request.session.session_key
            print(f"Created new session_id: {session_id}")
        
        # Double-check we have a session_id
        if not session_id:
            raise ValueError("Unable to create or retrieve session ID")
        
        print(f"Final session_id: {session_id}")
        cart, created = Cart.objects.get_or_create(
            session_id=session_id,
            defaults={'customer_email': ''}
        )
        print(f"Cart {'created' if created else 'retrieved'} with ID: {cart.id}")
        return cart
    
    def retrieve(self, request, *args, **kwargs):
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to cart"""
        cart = self.get_object()
        design_id = request.data.get('design_id')
        size = request.data.get('size')
        quantity = request.data.get('quantity', 1)
        
        if not all([design_id, size]):
            return Response({'detail': 'design_id and size are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            design = Design.objects.get(id=design_id)
            size_inventory = design.size_inventory.get(size=size, is_active=True)
            
            if size_inventory.stock < quantity:
                return Response({'detail': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
            
            cart_item, created = CartItem.objects.update_or_create(
                cart=cart,
                design=design,
                size=size,
                defaults={'quantity': quantity}
            )
            
            if not created and cart_item.quantity != quantity:
                cart_item.quantity = quantity
                cart_item.save()
            
            serializer = CartSerializer(cart)
            return Response(serializer.data)
            
        except Design.DoesNotExist:
            return Response({'detail': 'Design not found'}, status=status.HTTP_404_NOT_FOUND)
        except SizeInventory.DoesNotExist:
            return Response({'detail': 'Size not available'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Remove item from cart"""
        cart = self.get_object()
        design_id = request.data.get('design_id')
        size = request.data.get('size')
        
        try:
            cart_item = CartItem.objects.get(
                cart=cart,
                design_id=design_id,
                size=size
            )
            cart_item.delete()
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def clear_cart(self, request):
        """Clear all items from cart"""
        cart = self.get_object()
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


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
    queryset = Collection.objects.prefetch_related('materials', 'designs').all().order_by('order', 'code', '-created_at')
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
@authentication_classes([])
@permission_classes([AllowAny])
def owner_token(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''

    if not username or not password:
        return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request=request, username=username, password=password)
    if user is None:
        return Response({'detail': 'Unable to log in with provided credentials.'}, status=status.HTTP_400_BAD_REQUEST)

    if not user.is_active:
        return Response({'detail': 'This account is inactive.'}, status=status.HTTP_403_FORBIDDEN)

    if not user.is_staff:
        return Response({'detail': 'You do not have owner dashboard access.'}, status=status.HTTP_403_FORBIDDEN)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})


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

        # Create order items and adjust size-specific inventory
        for item in cart:
            design_id = item.get('id')
            size = item.get('size')
            qty = int(item.get('qty') or 1)
            design = Design.objects.filter(id=design_id).select_for_update().first()
            if not design:
                continue
            
            # Get size inventory and update stock
            try:
                size_inventory = SizeInventory.objects.filter(
                    design=design, size=size, is_active=True
                ).select_for_update().first()
                
                if not size_inventory or size_inventory.stock < qty:
                    # Skip this item if no inventory available
                    continue
                
                unit_price = design.effective_price
                OrderItem.objects.create(
                    order=order,
                    design=design,
                    size=size,
                    quantity=qty,
                    unit_price=unit_price,
                )
                
                # Update size-specific inventory
                size_inventory.stock = max(0, size_inventory.stock - qty)
                size_inventory.save(update_fields=['stock'])
                
            except SizeInventory.DoesNotExist:
                # Skip this item if size inventory doesn't exist
                continue

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
        resend_client = get_resend_client()

        if settings.RESEND_API_KEY and resend_client and customer_email:
            resend_client.api_key = settings.RESEND_API_KEY
            resend_client.Emails.send({
                "from": f"THE BLUE WARDROBE <no-reply@bluewardrobe.luxury>",
                "to": [customer_email],
                "subject": "Your order with THE BLUE WARDROBE",
                "html": f"<p>Thank you for your purchase.</p><p>Order #{order.id} — NGN {order.total_amount}</p>",
            })

        owner_email = getattr(settings, 'OWNER_EMAIL', '')
        if settings.RESEND_API_KEY and resend_client and owner_email:
            resend_client.api_key = settings.RESEND_API_KEY
            resend_client.Emails.send({
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
