from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import FileResponse, HttpResponse, HttpResponseRedirect, JsonResponse
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView
from rest_framework.authtoken.views import obtain_auth_token
from pathlib import Path


def health_check(request):
    return JsonResponse({"status": "ok"})


def frontend_app(request):
    frontend_dir = Path(settings.BASE_DIR).parent / 'frontend' / 'dist'
    index_candidates = [
        Path(settings.BASE_DIR) / 'templates' / 'index.html',
        frontend_dir / 'index.html',
    ]
    for index_file in index_candidates:
        if index_file.exists():
            return FileResponse(index_file.open('rb'), content_type='text/html')
    return HttpResponse('Frontend build is not available.', status=503, content_type='text/plain')


def favicon(request):
    from store.models import SiteAsset

    asset = SiteAsset.objects.filter(name='favicon').order_by('-uploaded_at').first()
    if asset and asset.file:
        return HttpResponseRedirect(asset.file.url)

    frontend_dir = Path(settings.BASE_DIR).parent / 'frontend' / 'dist'
    favicon_candidates = [
        frontend_dir / 'favicon.ico',
        Path(settings.STATIC_ROOT) / 'favicon.ico',
    ]
    for icon_file in favicon_candidates:
        if icon_file.exists():
            return FileResponse(icon_file.open('rb'), content_type='image/x-icon')
    return HttpResponse(status=204)


def legacy_asset_redirect(request, asset_path):
    return HttpResponseRedirect(f"{settings.STATIC_URL}assets/{asset_path}")


urlpatterns = [
    path('', frontend_app, name='frontend-root'),
    path('assets/<path:asset_path>', legacy_asset_redirect, name='legacy-asset-redirect'),
    path('favicon.ico', favicon, name='favicon'),
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/auth/token/', obtain_auth_token, name='api-token-auth'),
    path('api/', include('store.urls')),
    path('health/', health_check),
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
        re_path(r'^(?!api|admin|static|media).*$', frontend_app, name='react-app'),
    ]
