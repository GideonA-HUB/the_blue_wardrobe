#!/usr/bin/env python3
"""
Comprehensive fix for media file issues
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.db import transaction
from store.models import Design, DesignImage, SiteAsset, Video, Collection

def fix_all_media_paths():
    """Fix any media paths that might have duplicate /media/ prefixes"""
    print("🔧 Fixing media paths...")
    
    models_to_check = [
        (Design, 'video'),
        (DesignImage, 'image'),
        (Video, 'video_file'),
        (Video, 'thumbnail'),
        (Collection, 'featured_image'),
        (SiteAsset, 'file'),
    ]
    
    total_fixed = 0
    
    with transaction.atomic():
        for model, field_name in models_to_check:
            print(f"\n📁 Checking {model.__name__}.{field_name}...")
            
            for obj in model.objects.all():
                field_value = getattr(obj, field_name)
                if field_value and hasattr(field_value, 'name'):
                    file_name = field_value.name
                    
                    # Check for duplicate /media/ in the stored filename
                    if file_name.startswith('media/'):
                        # Fix by removing the leading 'media/'
                        fixed_name = file_name[6:]  # Remove 'media/'
                        field_value.name = fixed_name
                        obj.save(update_fields=[field_name])
                        print(f"  ✅ Fixed: {file_name} -> {fixed_name}")
                        total_fixed += 1
                    elif file_name.startswith('/media/'):
                        # Fix by removing the leading '/media/'
                        fixed_name = file_name[7:]  # Remove '/media/'
                        field_value.name = fixed_name
                        obj.save(update_fields=[field_name])
                        print(f"  ✅ Fixed: {file_name} -> {fixed_name}")
                        total_fixed += 1
    
    print(f"\n🎉 Total paths fixed: {total_fixed}")
    return total_fixed

def verify_urls():
    """Verify that URLs are correctly generated"""
    print("\n🔍 Verifying URL generation...")
    
    from django.conf import settings
    
    # Check SiteAsset URLs
    assets = SiteAsset.objects.all()
    for asset in assets:
        if asset.file:
            url = asset.file.url
            print(f"Asset {asset.name}: {url}")
            if url.count('/media/') > 1:
                print(f"  ❌ DUPLICATE /media/ detected!")
            else:
                print(f"  ✅ URL looks correct")
    
    # Check DesignImage URLs  
    images = DesignImage.objects.all()
    for img in images[:3]:  # Check first 3
        if img.image:
            url = img.image.url
            print(f"Image {img.id}: {url}")
            if url.count('/media/') > 1:
                print(f"  ❌ DUPLICATE /media/ detected!")
            else:
                print(f"  ✅ URL looks correct")

def main():
    """Main function"""
    print("🚀 Starting Comprehensive Media Fix...\n")
    
    try:
        # Fix any duplicate paths
        fixed_count = fix_all_media_paths()
        
        # Verify URLs
        verify_urls()
        
        if fixed_count > 0:
            print(f"\n✅ Fixed {fixed_count} media paths!")
        else:
            print("\n✅ No media path fixes needed!")
        
        print("\n🎉 Comprehensive media fix completed!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
