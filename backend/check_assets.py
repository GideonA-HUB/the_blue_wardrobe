#!/usr/bin/env python3
"""
Check the exact file URL generation issue
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from store.models import SiteAsset
from django.conf import settings

print('=== CHECKING SITE ASSETS ===')
print(f'MEDIA_ROOT: {settings.MEDIA_ROOT}')
print(f'MEDIA_URL: {settings.MEDIA_URL}')

assets = SiteAsset.objects.all()
for asset in assets:
    print(f'Asset {asset.id}: {asset.name}')
    print(f'  File field: {repr(asset.file)}')
    if asset.file:
        try:
            print(f'  File URL: {asset.file.url}')
            print(f'  File path: {asset.file.path}')
            print(f'  File name: {asset.file.name}')
        except Exception as e:
            print(f'  Error: {e}')
    print()

# Check if there are any assets with problematic URLs
print('=== LOOKING FOR DUPLICATE MEDIA PATHS ===')
for asset in assets:
    if asset.file and hasattr(asset.file, 'url'):
        url = asset.file.url
        if '/media/media/' in url:
            print(f'FOUND DUPLICATE in Asset {asset.id}: {url}')
        elif url.startswith('media/media/'):
            print(f'FOUND DUPLICATE in Asset {asset.id}: {url}')
