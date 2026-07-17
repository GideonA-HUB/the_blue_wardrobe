"""
Inject Open Graph / Twitter meta tags into the React SPA shell so social apps
(WhatsApp, Facebook, X, etc.) can render rich link previews for product pages.
Crawlers do not execute JavaScript, so tags must be present in the HTML response.
"""
from __future__ import annotations

import html
import logging
import re
from typing import Optional

from django.conf import settings

logger = logging.getLogger(__name__)

DESIGN_PATH_RE = re.compile(r'^/designs/(?P<id>\d+)/?$')
BLOG_PATH_RE = re.compile(r'^/blog/(?P<slug>[-\w]+)/?$')


def _absolute_url(request, path_or_url: str) -> str:
    if not path_or_url:
        return ''
    if path_or_url.startswith(('http://', 'https://')):
        return path_or_url
    if path_or_url.startswith('//'):
        return f'https:{path_or_url}'
    public = getattr(settings, 'PUBLIC_SITE_URL', '').rstrip('/')
    if public and path_or_url.startswith('/'):
        return f'{public}{path_or_url}'
    return request.build_absolute_uri(path_or_url)


def _canonical_page_url(request, path: str) -> str:
    public = getattr(settings, 'PUBLIC_SITE_URL', '').rstrip('/')
    if public:
        return f'{public}{path}'
    return request.build_absolute_uri(path)


def _clean_text(value: Optional[str], fallback: str, limit: int = 280) -> str:
    text = re.sub(r'\s+', ' ', (value or '').strip()) or fallback
    if len(text) > limit:
        return f'{text[: limit - 3].rstrip()}...'
    return text


def _media_url(request, file_field) -> Optional[str]:
    if not file_field:
        return None
    try:
        url = file_field.url
    except Exception:
        return None
    if not url:
        return None
    return _absolute_url(request, url)


def _design_share_payload(request, design_id: str) -> Optional[dict]:
    try:
        from store.models import Design

        design = (
            Design.objects.prefetch_related('images')
            .filter(pk=design_id)
            .first()
        )
        if not design:
            return None

        image = None
        first_image = design.images.order_by('order', 'created_at').first()
        if first_image:
            image = _media_url(request, first_image.image)

        path = f'/designs/{design.id}'
        title = f'{design.title} — THE BLUE WARDROBE'
        description = _clean_text(
            design.description,
            f'Discover {design.title} from THE BLUE WARDROBE — luxury fashion crafted from rare fabrics.',
        )
        return {
            'title': title,
            'description': description,
            'url': _canonical_page_url(request, path),
            'image': image,
            'type': 'product',
        }
    except Exception:
        logger.exception('Failed to build share meta for design %s', design_id)
        return None


def _blog_share_payload(request, slug: str) -> Optional[dict]:
    try:
        from store.models import BlogPost

        post = BlogPost.objects.filter(slug=slug, is_published=True).first()
        if not post:
            return None

        path = f'/blog/{post.slug}'
        title = f'{post.title} — THE BLUE WARDROBE'
        description = _clean_text(
            getattr(post, 'excerpt', None) or getattr(post, 'content', None),
            f'Read {post.title} on THE BLUE WARDROBE Journal.',
        )
        image = _media_url(request, getattr(post, 'cover_image', None))
        return {
            'title': title,
            'description': description,
            'url': _canonical_page_url(request, path),
            'image': image,
            'type': 'article',
        }
    except Exception:
        logger.exception('Failed to build share meta for blog slug %s', slug)
        return None


def resolve_share_payload(request) -> Optional[dict]:
    path = request.path or '/'
    design_match = DESIGN_PATH_RE.match(path)
    if design_match:
        return _design_share_payload(request, design_match.group('id'))

    blog_match = BLOG_PATH_RE.match(path)
    if blog_match:
        return _blog_share_payload(request, blog_match.group('slug'))

    return None


def _replace_or_append_meta(html_doc: str, attr: str, key: str, content: str) -> str:
    safe = html.escape(content, quote=True)
    pattern = re.compile(
        rf'<meta[^>]+{attr}=["\']{re.escape(key)}["\'][^>]*>',
        re.IGNORECASE,
    )
    tag = f'<meta {attr}="{key}" content="{safe}" />'
    if pattern.search(html_doc):
        return pattern.sub(tag, html_doc, count=1)
    return re.sub(r'</head>', f'  {tag}\n</head>', html_doc, count=1, flags=re.IGNORECASE)


def _replace_title(html_doc: str, title: str) -> str:
    safe = html.escape(title)
    if re.search(r'<title>.*?</title>', html_doc, flags=re.IGNORECASE | re.DOTALL):
        return re.sub(
            r'<title>.*?</title>',
            f'<title>{safe}</title>',
            html_doc,
            count=1,
            flags=re.IGNORECASE | re.DOTALL,
        )
    return re.sub(r'</head>', f'  <title>{safe}</title>\n</head>', html_doc, count=1, flags=re.IGNORECASE)


def inject_share_meta(html_doc: str, request) -> str:
    """Return HTML with product/article Open Graph tags when the path matches."""
    payload = resolve_share_payload(request)
    if not payload:
        return html_doc

    title = payload['title']
    description = payload['description']
    url = payload['url']
    image = payload.get('image')
    og_type = payload.get('type') or 'website'

    html_doc = _replace_title(html_doc, title)
    html_doc = _replace_or_append_meta(html_doc, 'name', 'description', description)
    html_doc = _replace_or_append_meta(html_doc, 'property', 'og:title', title)
    html_doc = _replace_or_append_meta(html_doc, 'property', 'og:description', description)
    html_doc = _replace_or_append_meta(html_doc, 'property', 'og:url', url)
    html_doc = _replace_or_append_meta(html_doc, 'property', 'og:type', og_type)
    html_doc = _replace_or_append_meta(html_doc, 'property', 'og:site_name', 'THE BLUE WARDROBE')
    html_doc = _replace_or_append_meta(
        html_doc,
        'name',
        'twitter:card',
        'summary_large_image' if image else 'summary',
    )
    html_doc = _replace_or_append_meta(html_doc, 'name', 'twitter:title', title)
    html_doc = _replace_or_append_meta(html_doc, 'name', 'twitter:description', description)

    if image:
        html_doc = _replace_or_append_meta(html_doc, 'property', 'og:image', image)
        html_doc = _replace_or_append_meta(html_doc, 'property', 'og:image:secure_url', image)
        html_doc = _replace_or_append_meta(html_doc, 'name', 'twitter:image', image)

    canonical = f'<link rel="canonical" href="{html.escape(url, quote=True)}" />'
    if re.search(r'<link[^>]+rel=["\']canonical["\']', html_doc, re.IGNORECASE):
        html_doc = re.sub(
            r'<link[^>]+rel=["\']canonical["\'][^>]*>',
            canonical,
            html_doc,
            count=1,
            flags=re.IGNORECASE,
        )
    else:
        html_doc = re.sub(r'</head>', f'  {canonical}\n</head>', html_doc, count=1, flags=re.IGNORECASE)

    return html_doc
