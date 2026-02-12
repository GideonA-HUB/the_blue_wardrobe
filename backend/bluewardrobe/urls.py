from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/auth/token/', obtain_auth_token, name='api-token-auth'),
    path('api/', include('store.urls')),
]

# Serve media files (uploaded assets like logo_primary and favicon) in development.
# In production on Railway, Cloudinary will serve media from its own domain.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
