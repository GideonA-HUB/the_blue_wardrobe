from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.conf.urls.static import static
import logging


logger = logging.getLogger(__name__)


def service_unavailable(detail):
    def view(request, *args, **kwargs):
        return JsonResponse({"detail": detail}, status=503)

    return view


def frontend_app(request):
    index_candidates = [
        settings.FRONTEND_BUILD_DIR / 'index.html',
        settings.BASE_DIR / 'templates' / 'index.html',
    ]
    for index_file in index_candidates:
        try:
            if index_file.exists():
                return HttpResponse(index_file.read_text(encoding='utf-8'), content_type='text/html')
        except Exception as exc:
            logger.exception('Failed to serve frontend index from %s: %s', index_file, exc)
    return HttpResponse('Frontend build is not available.', status=503, content_type='text/plain')


def favicon(request):
    favicon_candidates = [
        settings.FRONTEND_BUILD_DIR / 'favicon.ico',
        settings.FRONTEND_BUILD_DIR / 'favicon.svg',
        settings.STATIC_ROOT / 'favicon.ico',
        settings.STATIC_ROOT / 'favicon.svg',
    ]
    for icon_file in favicon_candidates:
        try:
            if icon_file.exists():
                content_type = 'image/svg+xml' if icon_file.suffix == '.svg' else 'image/x-icon'
                return HttpResponse(icon_file.read_bytes(), content_type=content_type)
        except Exception as exc:
            logger.exception('Failed to serve favicon file from %s: %s', icon_file, exc)

    try:
        from store.models import SiteAsset
    except Exception as exc:
        logger.exception('Failed to import SiteAsset for favicon handling: %s', exc)
        SiteAsset = None

    if SiteAsset is not None:
        try:
            asset = SiteAsset.objects.filter(name='favicon').order_by('-uploaded_at').first()
            if asset and asset.file:
                try:
                    return HttpResponseRedirect(asset.file.url)
                except Exception as exc:
                    logger.exception('Failed to resolve uploaded favicon URL: %s', exc)
        except Exception as exc:
            logger.exception('Failed to query uploaded favicon asset: %s', exc)
    fallback_svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        '<rect width="64" height="64" rx="12" fill="#dbeafe"/>'
        '<text x="50%" y="54%" text-anchor="middle" font-size="24" '
        'font-family="Georgia, serif" fill="#0f172a">TB</text>'
        '</svg>'
    )
    return HttpResponse(fallback_svg, content_type='image/svg+xml')


def legacy_asset_redirect(request, asset_path):
    return HttpResponseRedirect(f"{settings.STATIC_URL}assets/{asset_path}")


urlpatterns = [
    path('', frontend_app, name='frontend-root'),
    path('assets/<path:asset_path>', legacy_asset_redirect, name='legacy-asset-redirect'),
    path('favicon.ico', favicon, name='favicon'),
]

try:
    urlpatterns += [
        path('admin/', admin.site.urls),
    ]
except Exception as exc:
    logger.exception('Failed to register admin URLs: %s', exc)
    urlpatterns += [
        re_path(r'^admin(?:/.*)?$', service_unavailable('Admin is temporarily unavailable.')),
    ]

try:
    from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView

    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ]
except Exception as exc:
    logger.exception('Failed to register API documentation URLs: %s', exc)
    urlpatterns += [
        re_path(r'^api/(?:schema|docs)(?:/.*)?$', service_unavailable('API documentation is temporarily unavailable.')),
    ]

try:
    from store.views import owner_token

    urlpatterns += [
        path('api/auth/token/', owner_token, name='api-token-auth'),
    ]
except Exception as exc:
    logger.exception('Failed to register API auth URLs: %s', exc)
    urlpatterns += [
        re_path(r'^api/auth/token(?:/.*)?$', service_unavailable('API authentication is temporarily unavailable.')),
    ]

try:
    urlpatterns += [
        path('api/', include('store.urls')),
    ]
except Exception as exc:
    logger.exception('Failed to register store API URLs: %s', exc)
    urlpatterns += [
        re_path(r'^api(?:/.*)?$', service_unavailable('API is temporarily unavailable.')),
    ]

# Serve media files (uploaded assets like logo_primary and favicon) in development.
# In production on Railway, Cloudinary will serve media from its own domain.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve React app for all non-API routes (must be last)
# This allows React Router to handle client-side routing
if settings.FRONTEND_BUILD_DIR.exists():
    # Serve React app's index.html for all non-API routes
    urlpatterns += [
        re_path(r'^(?!api|admin|static|media).*$', frontend_app, name='react-app'),
    ]
