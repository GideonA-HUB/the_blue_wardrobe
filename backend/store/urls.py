from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CollectionViewSet,
    DesignViewSet,
    SiteAssetViewSet,
    VideoViewSet,
    InfoCardViewSet,
    AdminCollectionViewSet,
    AdminDesignViewSet,
    AdminVideoViewSet,
    AdminInfoCardViewSet,
    AdminOrderViewSet,
    AdminContactMessageViewSet,
    AdminSubscriberViewSet,
    AdminCustomerViewSet,
    AdminMaterialViewSet,
    subscribe,
    contact,
    initiate_paystack,
    verify_paystack,
    health,
    admin_metrics,
)

router = DefaultRouter()
router.register('collections', CollectionViewSet, basename='collections')
router.register('designs', DesignViewSet, basename='designs')
router.register('assets', SiteAssetViewSet, basename='assets')
router.register('videos', VideoViewSet, basename='videos')
router.register('info-cards', InfoCardViewSet, basename='info-cards')

# Admin routes
admin_router = DefaultRouter()
admin_router.register('collections', AdminCollectionViewSet, basename='admin-collections')
admin_router.register('designs', AdminDesignViewSet, basename='admin-designs')
admin_router.register('videos', AdminVideoViewSet, basename='admin-videos')
admin_router.register('info-cards', AdminInfoCardViewSet, basename='admin-info-cards')
admin_router.register('orders', AdminOrderViewSet, basename='admin-orders')
admin_router.register('contact-messages', AdminContactMessageViewSet, basename='admin-contact-messages')
admin_router.register('subscribers', AdminSubscriberViewSet, basename='admin-subscribers')
admin_router.register('customers', AdminCustomerViewSet, basename='admin-customers')
admin_router.register('materials', AdminMaterialViewSet, basename='admin-materials')

urlpatterns = [
    path('', include(router.urls)),
    path('subscribe/', subscribe, name='subscribe'),
    path('contact/', contact, name='contact'),
    path('paystack/initiate/', initiate_paystack, name='paystack-initiate'),
    path('paystack/verify/', verify_paystack, name='paystack-verify'),
    path('health/', health, name='health'),
    path('admin/metrics/', admin_metrics, name='admin-metrics'),
    path('admin/', include(admin_router.urls)),
]
