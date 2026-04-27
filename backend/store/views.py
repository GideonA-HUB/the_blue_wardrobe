from rest_framework import viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes, action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.conf import settings
from importlib import import_module
import json
import uuid
import requests
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.middleware.csrf import get_token

from .models import (
    Collection, Design, DesignImage, SizeInventory, SizeMeasurement, Cart, CartItem, SiteAsset, ContactMessage, Subscriber, Order,
    Customer, OrderItem, PaymentLog, Video, VideoComment, VideoLike, VideoCommentLike, InfoCard, Material, DesignReview,
    HomeHeroCopy, HeroMarqueeSlide, AtelierStorySlide,
)
from .payment_utils import finalize_order_from_cart, parse_flutterwave_meta, send_order_emails
from .email_utils import newsletter_welcome_html
from .serializers import (
    CollectionSerializer, DesignSerializer, SiteAssetSerializer,
    ContactMessageSerializer, SubscriberSerializer, OrderSerializer,
    VideoSerializer, VideoCommentSerializer, InfoCardSerializer, MaterialSerializer, CustomerSerializer,
    CartSerializer, CartItemSerializer, DesignReviewSerializer,
    HeroMarqueeSlideSerializer, AtelierStorySlideSerializer,
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
    queryset = Design.objects.prefetch_related('images', 'size_inventory', 'size_measurements', 'reviews').all()
    serializer_class = DesignSerializer

    @action(detail=True, methods=['get', 'post'])
    def reviews(self, request, pk=None):
        """Get reviews for a design or submit a new review"""
        design = self.get_object()
        
        if request.method == 'GET':
            # Get approved reviews
            reviews = design.reviews.filter(is_approved=True).order_by('-created_at')
            serializer = DesignReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Submit a new review
            data = request.data.copy()
            data['design'] = design.id
            
            serializer = DesignReviewSerializer(data=data)
            if serializer.is_valid():
                try:
                    review = serializer.save()
                    return Response(DesignReviewSerializer(review).data, status=201)
                except Exception as e:
                    return Response({
                        'error': 'Failed to save review',
                        'details': str(e)
                    }, status=500)
            else:
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=400)


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
        size_measurement_id = request.data.get('size_measurement_id')
        quantity = request.data.get('quantity', 1)
        
        if not all([design_id, size_measurement_id]):
            return Response({'detail': 'design_id and size_measurement_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            design = Design.objects.get(id=design_id)
            size_measurement = design.size_measurements.get(id=size_measurement_id, is_active=True)
            
            if size_measurement.stock < quantity:
                return Response({'detail': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
            
            cart_item, created = CartItem.objects.update_or_create(
                cart=cart,
                design=design,
                size_measurement=size_measurement,
                defaults={'quantity': quantity}
            )
            
            if not created and cart_item.quantity != quantity:
                cart_item.quantity = quantity
                cart_item.save()
            
            serializer = CartSerializer(cart)
            return Response(serializer.data)
            
        except Design.DoesNotExist:
            return Response({'detail': 'Design not found'}, status=status.HTTP_404_NOT_FOUND)
        except SizeMeasurement.DoesNotExist:
            return Response({'detail': 'Size measurement not available'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Remove item from cart"""
        cart = self.get_object()
        design_id = request.data.get('design_id')
        size_measurement_id = request.data.get('size_measurement_id')
        size = request.data.get('size')
        
        if not design_id:
            return Response({'detail': 'design_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Robust matching:
        # 1) Prefer explicit size_measurement_id.
        # 2) Fallback to design + size for older clients.
        # 3) As final fallback, remove latest line for that design.
        queryset = CartItem.objects.filter(cart=cart, design_id=design_id)
        if size_measurement_id:
            queryset = queryset.filter(size_measurement_id=size_measurement_id)
        elif size is not None:
            queryset = queryset.filter(size_measurement__size=size)

        cart_item = queryset.order_by('-id').first()
        if not cart_item:
            return Response({'detail': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
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


@api_view(['GET'])
@permission_classes([AllowAny])
def homepage_content(request):
    """
    Public bundle for home hero copy, marquee images, and Atelier interactive selector slides.
    """
    hero_copy, _ = HomeHeroCopy.objects.get_or_create(
        pk=1,
        defaults={
            'tagline': 'Discover Timeless Elegance',
            'title_line_1': 'THE BLUE',
            'title_line_2': 'WARDROBE',
            'description': (
                'Rare fabrics. Timeless design. Global luxury. Experience our exclusive collections '
                'crafted with attention to detail and the finest materials.'
            ),
        },
    )
    ctx = {'request': request}
    hero_slides = HeroMarqueeSlide.objects.filter(is_active=True).order_by('sort_order', 'id')
    atelier_slides = AtelierStorySlide.objects.filter(is_active=True).order_by('sort_order', 'id')
    return Response(
        {
            'hero': {
                'tagline': hero_copy.tagline,
                'title_line_1': hero_copy.title_line_1,
                'title_line_2': hero_copy.title_line_2,
                'description': hero_copy.description,
                'slides': HeroMarqueeSlideSerializer(hero_slides, many=True, context=ctx).data,
            },
            'atelier_slides': AtelierStorySlideSerializer(atelier_slides, many=True, context=ctx).data,
        }
    )


class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Video.objects.all().order_by('order', '-created_at')
    serializer_class = VideoSerializer
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        video = self.get_object()
        
        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        session_key = request.session.session_key or ''
        
        if ip_address:
            like, created = VideoLike.objects.get_or_create(
                video=video,
                ip_address=ip_address,
                defaults={'session_key': session_key}
            )
            
            if created:
                return Response({
                    'liked': True, 
                    'likes_count': video.likes_count
                })
            else:
                like.delete()
                return Response({
                    'liked': False, 
                    'likes_count': video.likes_count
                })
        
        return Response({'error': 'Unable to process like'}, status=400)
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        video = self.get_object()
        video.increment_views()
        return Response({'views': video.views})
    
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        video = self.get_object()
        
        if request.method == 'GET':
            comments = video.comments.filter(is_active=True, parent=None)
            serializer = VideoCommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            data = request.data.copy()
            
            # Handle parent field - remove if empty or invalid
            parent_id = data.get('parent')
            if parent_id is None or parent_id == '':
                data.pop('parent', None)
            else:
                # Try to convert parent to int and validate
                try:
                    parent_id = int(parent_id)
                    # Verify parent exists and belongs to the same video
                    parent_comment = VideoComment.objects.get(
                        id=parent_id, 
                        video=video, 
                        is_active=True
                    )
                    # Keep the ID for the serializer
                    data['parent'] = parent_id
                except (ValueError, TypeError, VideoComment.DoesNotExist):
                    # If parent validation fails, treat as top-level comment
                    data.pop('parent', None)
            
            # Add video to data (since it's read_only in serializer)
            data['video'] = video.id
            
            serializer = VideoCommentSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                try:
                    comment = serializer.save()
                    return Response(VideoCommentSerializer(comment, context={'request': request}).data, status=201)
                except Exception as e:
                    return Response({
                        'error': 'Failed to save comment',
                        'details': str(e)
                    }, status=500)
            else:
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=400)
    
    @action(detail=True, methods=['post'], url_path='comments/(?P<comment_id>[^/.]+)/like')
    def comment_like(self, request, pk=None, comment_id=None):
        """Like or unlike a specific comment"""
        try:
            comment = VideoComment.objects.get(id=comment_id, video__id=pk, is_active=True)
        except VideoComment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=404)
        
        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        session_key = request.session.session_key or ''
        
        if ip_address:
            like, created = VideoCommentLike.objects.get_or_create(
                comment=comment,
                ip_address=ip_address,
                defaults={'session_key': session_key}
            )
            
            if created:
                return Response({
                    'liked': True, 
                    'likes_count': comment.likes_count
                })
            else:
                like.delete()
                return Response({
                    'liked': False, 
                    'likes_count': comment.likes_count
                })
        
        return Response({'error': 'Unable to process like'}, status=400)


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


class AdminDesignReviewViewSet(viewsets.ModelViewSet):
    """Admin ViewSet for managing design reviews"""
    queryset = DesignReview.objects.all().order_by('-created_at')
    serializer_class = DesignReviewSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['design', 'rating', 'is_approved']
    search_fields = ['name', 'email', 'comment', 'design__title', 'design__sku']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        design_id = self.request.query_params.get('design_id')
        if design_id:
            queryset = queryset.filter(design_id=design_id)
        return queryset


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
        email = serializer.validated_data.get('email')
        try:
            resend_client = get_resend_client()
            if settings.RESEND_API_KEY and resend_client and email:
                resend_client.api_key = settings.RESEND_API_KEY
                resend_client.Emails.send({
                    'from': settings.RESEND_FROM_EMAIL,
                    'to': [email],
                    'subject': f"You're on the list — {settings.SITE_NAME}",
                    'html': newsletter_welcome_html(site_name=settings.SITE_NAME),
                })
        except Exception:
            pass
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
    if not settings.PAYSTACK_SECRET:
        return Response({'detail': 'Paystack is not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    data = request.data
    email = data.get('email')
    amount = int(float(data.get('amount', 0)) * 100)  # in kobo
    metadata = data.get('metadata', {})
    customer_meta = metadata.get('customer') or {}
    phone = (metadata.get('phone') or customer_meta.get('phone') or '').strip()
    delivery = (metadata.get('deliveryAddress') or '').strip()
    if not phone or len(phone) < 5:
        return Response({'detail': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not delivery:
        return Response({'detail': 'Delivery address is required'}, status=status.HTTP_400_BAD_REQUEST)

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
def initiate_flutterwave(request):
    """
    Same payload shape as Paystack: { email, amount, metadata: { cart, customer, phone? } }.
    Returns Flutterwave checkout link in data.link.
    """
    if not settings.FLUTTERWAVE_SECRET_KEY:
        return Response({'detail': 'Flutterwave is not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    data = request.data
    email = (data.get('email') or '').strip()
    amount_raw = float(data.get('amount', 0) or 0)
    metadata = data.get('metadata') or {}
    customer_meta = metadata.get('customer') or {}
    name = f"{customer_meta.get('firstName', '').strip()} {customer_meta.get('lastName', '').strip()}".strip() or email
    phone = (metadata.get('phone') or customer_meta.get('phone') or '').strip()
    delivery = (metadata.get('deliveryAddress') or '').strip()
    if not phone or len(phone) < 5:
        return Response({'detail': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not delivery:
        return Response({'detail': 'Delivery address is required'}, status=status.HTTP_400_BAD_REQUEST)

    tx_ref = f"TBW-{uuid.uuid4().hex}"
    redirect_url = f"{settings.PUBLIC_SITE_URL.rstrip('/')}/success"
    tbw_meta = json.dumps({
        'cart': metadata.get('cart') or [],
        'customer': customer_meta,
        'phone': phone,
        'email': email,
    })

    payload = {
        'tx_ref': tx_ref,
        'amount': f'{amount_raw:.2f}',
        'currency': 'NGN',
        'redirect_url': redirect_url,
        'payment_options': 'card,account,ussd,mobilemoney',
        'customer': {
            'email': email,
            'name': name,
            'phone_number': phone,
        },
        'customizations': {
            'title': settings.SITE_NAME,
            'description': 'Order payment',
        },
        # Object form per Flutterwave v3 Standard API (echoed on verify)
        'meta': {'tbw_metadata': tbw_meta},
    }
    headers = {
        'Authorization': f'Bearer {settings.FLUTTERWAVE_SECRET_KEY}',
        'Content-Type': 'application/json',
    }
    resp = requests.post(
        'https://api.flutterwave.com/v3/payments',
        json=payload,
        headers=headers,
        timeout=60,
    )
    body = resp.json() if resp.content else {}
    if resp.status_code != 200 or body.get('status') != 'success':
        return Response(
            {'detail': body.get('message') or 'Failed to contact Flutterwave'},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    return Response(body)


@api_view(['POST'])
def verify_paystack(request):
    if not settings.PAYSTACK_SECRET:
        return Response({'detail': 'Paystack is not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
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
        PaymentLog.objects.create(
            gateway='paystack',
            reference=reference,
            status=status_str or 'failed',
            amount=amount,
            raw_response=payload,
        )
        return Response({'detail': 'payment not successful', 'status': status_str}, status=status.HTTP_400_BAD_REQUEST)

    order, created_new = finalize_order_from_cart(
        gateway='paystack',
        reference=reference,
        amount=amount,
        status_str=status_str,
        raw_payload=payload,
        customer_email=customer_email,
        cart=cart,
        customer_meta=customer_meta,
        metadata=metadata,
        paystack_reference=reference,
        flutterwave_tx_ref='',
    )
    if created_new:
        send_order_emails(order, customer_email)

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def verify_flutterwave(request):
    if not settings.FLUTTERWAVE_SECRET_KEY:
        return Response({'detail': 'Flutterwave is not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    tx_ref = (request.data.get('tx_ref') or '').strip()
    transaction_id = (request.data.get('transaction_id') or '').strip()
    if not tx_ref and not transaction_id:
        return Response({'detail': 'tx_ref or transaction_id required'}, status=status.HTTP_400_BAD_REQUEST)

    headers = {'Authorization': f'Bearer {settings.FLUTTERWAVE_SECRET_KEY}'}
    # Prefer tx_ref (our canonical idempotency key); fall back to transaction_id when redirects omit tx_ref.
    if tx_ref:
        resp = requests.get(
            'https://api.flutterwave.com/v3/transactions/verify_by_reference',
            params={'tx_ref': tx_ref},
            headers=headers,
            timeout=60,
        )
    else:
        resp = requests.get(
            f'https://api.flutterwave.com/v3/transactions/{transaction_id}/verify',
            headers=headers,
            timeout=60,
        )
    payload = resp.json() if resp.content else {}
    if resp.status_code != 200 or payload.get('status') != 'success':
        return Response(
            {'detail': payload.get('message') or 'verification failed'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    data = payload.get('data') or {}
    status_str = (data.get('status') or '').lower()
    resolved_tx_ref = (data.get('tx_ref') or tx_ref or '').strip()
    if status_str != 'successful':
        PaymentLog.objects.create(
            gateway='flutterwave',
            reference=resolved_tx_ref or transaction_id,
            status=status_str or 'failed',
            amount=float(data.get('amount') or 0),
            raw_response=payload,
        )
        return Response({'detail': 'payment not successful', 'status': status_str}, status=status.HTTP_400_BAD_REQUEST)

    meta = parse_flutterwave_meta(data)
    cart = meta.get('cart') or []
    customer_meta = meta.get('customer') or {}
    metadata = {
        'phone': meta.get('phone', ''),
        'email': meta.get('email', ''),
    }
    customer_email = (data.get('customer') or {}).get('email') or meta.get('email')
    amount = float(data.get('amount') or 0)

    order, created_new = finalize_order_from_cart(
        gateway='flutterwave',
        reference=resolved_tx_ref or transaction_id,
        amount=amount,
        status_str='successful',
        raw_payload=payload,
        customer_email=customer_email,
        cart=cart,
        customer_meta=customer_meta,
        metadata=metadata,
        paystack_reference='',
        flutterwave_tx_ref=resolved_tx_ref or transaction_id,
    )
    if created_new:
        send_order_emails(order, customer_email)

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


@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token(request):
    """Get CSRF token for the frontend"""
    return Response({'csrfToken': get_token(request)})
