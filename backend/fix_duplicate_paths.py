#!/usr/bin/env python3
"""
Fix the duplicate /media/ paths in database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.db import transaction
from store.models import Design, DesignImage, Video, Collection, SiteAsset

def fix_duplicate_media_paths():
    """Fix duplicate /media/ paths in database"""
    print("🔧 FIXING DUPLICATE MEDIA PATHS...")
    
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
                    
                    # Fix duplicate /media/ paths
                    if file_name.startswith('media/media/'):
                        fixed_name = file_name.replace('media/media/', 'media/')
                        field_value.name = fixed_name
                        obj.save(update_fields=[field_name])
                        print(f"  ✅ Fixed: {file_name}")
                        print(f"     -> {fixed_name}")
                        total_fixed += 1
                    elif file_name.startswith('/media/media/'):
                        fixed_name = file_name.replace('/media/media/', '/media/')
                        field_value.name = fixed_name
                        obj.save(update_fields=[field_name])
                        print(f"  ✅ Fixed: {file_name}")
                        print(f"     -> {fixed_name}")
                        total_fixed += 1
    
    print(f"\n🎉 Total fixed: {total_fixed}")
    return total_fixed

def main():
    fixed = fix_duplicate_media_paths()
    if fixed > 0:
        print(f"\n✅ SUCCESS: Fixed {fixed} duplicate media paths!")
    else:
        print("\n✅ No duplicate paths found!")

if __name__ == "__main__":
    main()
