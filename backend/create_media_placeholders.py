#!/usr/bin/env python3
"""
Create essential media files for production
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.conf import settings
from store.models import SiteAsset

def create_placeholder_media():
    """Create placeholder files for missing media"""
    print("🎨 Creating placeholder media files...")
    
    media_root = settings.MEDIA_ROOT
    
    # Create directory structure
    dirs_to_create = [
        'assets',
        'designs/images',
        'designs/videos', 
        'videos',
        'video_thumbnails',
        'collections',
        'business',
        'blog/covers',
        'blog/media',
        'info_cards'
    ]
    
    for dir_path in dirs_to_create:
        full_path = os.path.join(media_root, dir_path)
        os.makedirs(full_path, exist_ok=True)
        print(f"  ✅ Created directory: {full_path}")
    
    # Create a simple placeholder image
    placeholder_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
    
    placeholder_path = os.path.join(media_root, 'assets', 'placeholder.png')
    if not os.path.exists(placeholder_path):
        with open(placeholder_path, 'wb') as f:
            f.write(placeholder_content)
        print(f"  ✅ Created placeholder image: {placeholder_path}")
    
    # Update SiteAsset to use placeholder if file doesn't exist
    assets = SiteAsset.objects.all()
    for asset in assets:
        if asset.file and not os.path.exists(asset.file.path):
            asset.file.name = 'assets/placeholder.png'
            asset.save(update_fields=['file'])
            print(f"  ✅ Updated {asset.name} to use placeholder")
    
    print("🎉 Placeholder media files created!")

if __name__ == "__main__":
    create_placeholder_media()
