#!/usr/bin/env python3
"""
Script to fix duplicate media paths in database
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.db import transaction
from store.models import Design, DesignImage, Video, Collection, SiteAsset

def fix_media_paths():
    """Fix duplicate /media/ paths in database"""
    print("🔧 Fixing duplicate media paths...")
    
    models_to_check = [
        (Design, 'video'),
        (DesignImage, 'image'),
        (Video, 'video_file'),
        (Video, 'thumbnail'),
        (Collection, 'featured_image'),
        (SiteAsset, 'file'),
    ]
    
    total_fixed = 0
    
    for model, field_name in models_to_check:
        print(f"\n📁 Checking {model.__name__}.{field_name}...")
        
        with transaction.atomic():
            for obj in model.objects.all():
                field_value = getattr(obj, field_name)
                if field_value and isinstance(field_value, str):
                    # Check for duplicate /media/media/ paths
                    if field_value.startswith('media/media/'):
                        # Fix the path by removing the duplicate
                        fixed_path = field_value.replace('media/media/', 'media/')
                        setattr(obj, field_name, fixed_path)
                        obj.save(update_fields=[field_name])
                        print(f"  ✅ Fixed: {field_value} -> {fixed_path}")
                        total_fixed += 1
                    elif field_value.startswith('/media/media/'):
                        # Fix the path by removing the duplicate
                        fixed_path = field_value.replace('/media/media/', '/media/')
                        setattr(obj, field_name, fixed_path)
                        obj.save(update_fields=[field_name])
                        print(f"  ✅ Fixed: {field_value} -> {fixed_path}")
                        total_fixed += 1
    
    print(f"\n🎉 Total paths fixed: {total_fixed}")
    return total_fixed

def check_file_existence():
    """Check if files actually exist in media directory"""
    print("\n🔍 Checking file existence...")
    
    from django.conf import settings
    
    media_root = settings.MEDIA_ROOT
    print(f"Media root: {media_root}")
    
    models_to_check = [
        (Design, 'video'),
        (DesignImage, 'image'),
        (Video, 'video_file'),
        (Video, 'thumbnail'),
        (Collection, 'featured_image'),
        (SiteAsset, 'file'),
    ]
    
    missing_files = []
    
    for model, field_name in models_to_check:
        print(f"\n📁 Checking {model.__name__}.{field_name} existence...")
        
        for obj in model.objects.all():
            field_value = getattr(obj, field_name)
            if field_value and isinstance(field_value, str):
                # Remove leading /media/ if present
                if field_value.startswith('/media/'):
                    file_path = field_value[7:]  # Remove /media/
                else:
                    file_path = field_value
                
                full_path = os.path.join(media_root, file_path)
                
                if not os.path.exists(full_path):
                    missing_files.append((model.__name__, obj.id, field_name, field_value, full_path))
                    print(f"  ❌ Missing: {field_value} -> {full_path}")
                else:
                    print(f"  ✅ Exists: {field_value}")
    
    if missing_files:
        print(f"\n⚠️  Total missing files: {len(missing_files)}")
        for model_name, obj_id, field_name, field_value, full_path in missing_files:
            print(f"  - {model_name}({obj_id}).{field_name}: {field_value}")
    else:
        print("\n✅ All files exist!")
    
    return missing_files

def main():
    """Main function"""
    print("🚀 Starting Media Path Fix...\n")
    
    try:
        # Fix duplicate paths
        fixed_count = fix_media_paths()
        
        # Check file existence
        missing_files = check_file_existence()
        
        if fixed_count > 0:
            print(f"\n✅ Fixed {fixed_count} duplicate media paths!")
        else:
            print("\n✅ No duplicate paths found!")
        
        if missing_files:
            print(f"\n⚠️  {len(missing_files)} files are missing from the filesystem.")
            print("These may need to be re-uploaded or the paths may be incorrect.")
        else:
            print("\n✅ All files are present and correctly pathed!")
        
        print("\n🎉 Media path fix completed!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
