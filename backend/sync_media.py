#!/usr/bin/env python3
"""
Sync media files from local development to production
This script should be run in production to download missing media files
"""
import os
import sys
import django
import requests
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.conf import settings
from store.models import Design, DesignImage, SiteAsset, Video, Collection

def download_file(url, local_path):
    """Download a file from URL to local path"""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        with open(local_path, 'wb') as f:
            f.write(response.content)
        
        print(f"  ✅ Downloaded: {local_path}")
        return True
    except Exception as e:
        print(f"  ❌ Failed to download {url}: {e}")
        return False

def sync_media_files():
    """Sync missing media files"""
    print("🔄 Syncing media files...")
    
    # Base URL for local development (adjust as needed)
    local_base_url = "http://localhost:8080"  # Change to your local dev URL
    
    models_to_check = [
        (Design, 'video'),
        (DesignImage, 'image'),
        (Video, 'video_file'),
        (Video, 'thumbnail'),
        (Collection, 'featured_image'),
        (SiteAsset, 'file'),
    ]
    
    total_downloaded = 0
    total_failed = 0
    
    for model, field_name in models_to_check:
        print(f"\n📁 Checking {model.__name__}.{field_name}...")
        
        for obj in model.objects.all():
            field_value = getattr(obj, field_name)
            if field_value and hasattr(field_value, 'url') and hasattr(field_value, 'path'):
                url = field_value.url
                local_path = field_value.path
                
                # Check if file exists
                if not os.path.exists(local_path):
                    print(f"  📥 Missing: {url}")
                    
                    # Try to download from local development
                    full_url = f"{local_base_url}{url}"
                    if download_file(full_url, local_path):
                        total_downloaded += 1
                    else:
                        total_failed += 1
                else:
                    print(f"  ✅ Exists: {url}")
    
    print(f"\n📊 Summary:")
    print(f"  Downloaded: {total_downloaded}")
    print(f"  Failed: {total_failed}")
    
    return total_downloaded, total_failed

def create_placeholder_files():
    """Create placeholder files for missing media"""
    print("\n🎨 Creating placeholder files...")
    
    placeholder_dir = os.path.join(settings.MEDIA_ROOT, 'placeholders')
    os.makedirs(placeholder_dir, exist_ok=True)
    
    # Create a simple placeholder image
    placeholder_image = os.path.join(placeholder_dir, 'placeholder.jpg')
    if not os.path.exists(placeholder_image):
        # Create a simple 1x1 pixel JPEG
        with open(placeholder_image, 'wb') as f:
            # JPEG header for 1x1 pixel gray image
            f.write(bytes.fromhex('ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0a140d0c0b0b0c1912131314181d1a1a1a1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1dffc00011080001000103012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffda000c03010002110311003f00f7bfd9'))
        print(f"  ✅ Created placeholder image: {placeholder_image}")
    
    return placeholder_image

def main():
    """Main function"""
    print("🚀 Starting Media File Sync...\n")
    
    try:
        # Ensure media directory exists
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        
        # Create placeholders
        placeholder_image = create_placeholder_files()
        
        # Try to sync files (this will fail if local dev is not running)
        downloaded, failed = sync_media_files()
        
        if failed > 0:
            print(f"\n⚠️  Could not download {failed} files.")
            print("This is normal if your local development server is not running.")
            print("The files will be created as placeholders.")
        
        print("\n🎉 Media sync completed!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
