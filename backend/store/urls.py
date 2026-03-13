from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .content_views import (
    AdminBlogCommentLikeViewSet,
    AdminBlogCommentViewSet,
    AdminBlogPostLikeViewSet,
    AdminBlogPostMediaViewSet,
    AdminBlogPostViewSet,
    AdminBusinessProfileViewSet,
    BlogPostViewSet,
    BusinessProfileViewSet,
    toggle_comment_like,
)
from .views import (
    CollectionViewSet,
    DesignViewSet,
    CartViewSet,
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
router.register('business-profile', BusinessProfileViewSet, basename='business-profile')
router.register('blog', BlogPostViewSet, basename='blog')

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
admin_router.register('business-profile', AdminBusinessProfileViewSet, basename='admin-business-profile')
admin_router.register('blog-posts', AdminBlogPostViewSet, basename='admin-blog-posts')
admin_router.register('blog-media', AdminBlogPostMediaViewSet, basename='admin-blog-media')
admin_router.register('blog-comments', AdminBlogCommentViewSet, basename='admin-blog-comments')
admin_router.register('blog-post-likes', AdminBlogPostLikeViewSet, basename='admin-blog-post-likes')
admin_router.register('blog-comment-likes', AdminBlogCommentLikeViewSet, basename='admin-blog-comment-likes')

urlpatterns = [
    path('', include(router.urls)),
    path('blog/comments/<int:comment_id>/toggle-like/', toggle_comment_like, name='blog-comment-toggle-like'),
    # Cart URLs
    path('cart/', CartViewSet.as_view({'get': 'list', 'post': 'create'}), name='cart-list'),
    path('cart/add/', CartViewSet.as_view({'post': 'add_item'}), name='cart-add'),
    path('cart/remove/', CartViewSet.as_view({'post': 'remove_item'}), name='cart-remove'),
    path('cart/clear/', CartViewSet.as_view({'post': 'clear_cart'}), name='cart-clear'),
    path('cart/<int:pk>/', CartViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='cart-detail'),
    # Other URLs
    path('subscribe/', subscribe, name='subscribe'),
    path('contact/', contact, name='contact'),
    path('paystack/initiate/', initiate_paystack, name='paystack-initiate'),
    path('paystack/verify/', verify_paystack, name='paystack-verify'),
    path('health/', health, name='health'),
    path('admin/metrics/', admin_metrics, name='admin-metrics'),
    path('admin/', include(admin_router.urls)),
]
