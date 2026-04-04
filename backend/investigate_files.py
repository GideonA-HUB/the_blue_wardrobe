#!/usr/bin/env python3
"""
Deep investigation of the file issues
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from store.models import Design, DesignImage
from django.conf import settings

print('=== DEEP INVESTIGATION ===')
print(f'MEDIA_ROOT: {settings.MEDIA_ROOT}')
print(f'MEDIA_URL: {settings.MEDIA_URL}')
print(f'USE_CLOUDINARY: {settings.USE_CLOUDINARY}')
print()

# Check Design objects with video fields
print('=== DESIGN VIDEO FIELDS ===')
designs = Design.objects.all()
for design in designs:
    print(f'Design {design.id}: {design.sku}')
    print(f'  Video field: {repr(design.video)}')
    if design.video:
        try:
            print(f'  Video URL: {design.video.url}')
            print(f'  Video path: {design.video.path}')
            print(f'  Video name: {design.video.name}')
        except Exception as e:
            print(f'  Error accessing video: {e}')
    print()

# Check DesignImage objects
print('=== DESIGN IMAGE FIELDS ===')
images = DesignImage.objects.all()
for img in images[:5]:  # Check first 5
    print(f'Image {img.id} for Design {img.design.id}')
    print(f'  Image field: {repr(img.image)}')
    if img.image:
        try:
            print(f'  Image URL: {img.image.url}')
            print(f'  Image path: {img.image.path}')
            print(f'  Image name: {img.image.name}')
        except Exception as e:
            print(f'  Error accessing image: {e}')
    print()

# Check actual media directory structure
print('=== MEDIA DIRECTORY STRUCTURE ===')
media_root_str = str(settings.MEDIA_ROOT)
if os.path.exists(settings.MEDIA_ROOT):
    for root, dirs, files in os.walk(settings.MEDIA_ROOT):
        level = root.replace(media_root_str, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f'{indent}{os.path.basename(root)}/')
        subindent = ' ' * 2 * (level + 1)
        for file in files[:5]:  # Limit to first 5 files per dir
            print(f'{subindent}{file}')
        if len(files) > 5:
            print(f'{subindent}... and {len(files) - 5} more files')
else:
    print('Media directory does not exist!')

print()
print('=== ANALYSIS ===')
print('Looking for patterns in the data...')

# Check for duplicate media paths
for design in designs:
    if design.video and isinstance(design.video, str):
        if design.video.startswith('media/media/'):
            print(f'FOUND DUPLICATE PATH in Design {design.id}: {design.video}')
        elif design.video.startswith('/media/media/'):
            print(f'FOUND DUPLICATE PATH in Design {design.id}: {design.video}')

for img in images:
    if img.image and isinstance(img.image, str):
        if img.image.startswith('media/media/'):
            print(f'FOUND DUPLICATE PATH in Image {img.id}: {img.image}')
        elif img.image.startswith('/media/media/'):
            print(f'FOUND DUPLICATE PATH in Image {img.id}: {img.image}')
