from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView
from rest_framework.authtoken.views import obtain_auth_token
from pathlib import Path

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

# Serve React app for all non-API routes (must be last)
# This allows React Router to handle client-side routing
frontend_dir = Path(settings.BASE_DIR).parent / 'frontend' / 'dist'
if frontend_dir.exists():
    # Serve React app's index.html for all non-API routes
    urlpatterns += [
        re_path(r'^(?!api|admin|static|media).*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
    ]
