#!/usr/bin/env python3
"""
Deep investigation of production media path issues
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.db import connection
from store.models import Design, DesignImage, SiteAsset
from django.conf import settings

def investigate_production_database():
    """Investigate what's actually in the production database"""
    print("🔍 DEEP INVESTIGATION OF PRODUCTION DATABASE")
    print("=" * 60)
    
    print(f"Media Root: {settings.MEDIA_ROOT}")
    print(f"Media URL: {settings.MEDIA_URL}")
    print(f"USE_CLOUDINARY: {settings.USE_CLOUDINARY}")
    print()
    
    # Check raw database values
    with connection.cursor() as cursor:
        print("📊 RAW DATABASE VALUES:")
        print("-" * 30)
        
        # Check designs
        cursor.execute("SELECT id, sku, video FROM store_design WHERE video IS NOT NULL")
        designs = cursor.fetchall()
        print(f"Designs with videos: {len(designs)}")
        for design_id, sku, video in designs:
            print(f"  Design {design_id} ({sku}): {repr(video)}")
            if video and video.startswith('media/'):
                print(f"    ❌ STARTS WITH 'media/' - THIS CAUSES DUPLICATE!")
        
        print()
        
        # Check design images
        cursor.execute("SELECT id, design_id, image FROM store_designimage WHERE image IS NOT NULL LIMIT 10")
        images = cursor.fetchall()
        print(f"Design images (first 10): {len(images)}")
        for img_id, design_id, image in images:
            print(f"  Image {img_id} (Design {design_id}): {repr(image)}")
            if image and image.startswith('media/'):
                print(f"    ❌ STARTS WITH 'media/' - THIS CAUSES DUPLICATE!")
        
        print()
        
        # Check site assets
        cursor.execute("SELECT id, name, file FROM store_siteasset WHERE file IS NOT NULL")
        assets = cursor.fetchall()
        print(f"Site assets: {len(assets)}")
        for asset_id, name, file_path in assets:
            print(f"  Asset {asset_id} ({name}): {repr(file_path)}")
            if file_path and file_path.startswith('media/'):
                print(f"    ❌ STARTS WITH 'media/' - THIS CAUSES DUPLICATE!")

def check_filesystem_vs_database():
    """Check what files exist vs what's in database"""
    print("\n📁 FILESYSTEM vs DATABASE COMPARISON")
    print("-" * 40)
    
    media_root = settings.MEDIA_ROOT
    print(f"Checking media root: {media_root}")
    
    if os.path.exists(media_root):
        print("✅ Media directory exists")
        # List what's actually there
        for root, dirs, files in os.walk(media_root):
            level = root.replace(str(media_root), '').count(os.sep)
            indent = '  ' * level
            print(f"{indent}{os.path.basename(root)}/")
            subindent = '  ' * (level + 1)
            for file in files[:5]:  # First 5 files
                print(f"{subindent}{file}")
            if len(files) > 5:
                print(f"{subindent}... and {len(files) - 5} more")
    else:
        print("❌ Media directory does not exist!")
    
    print()
    
    # Check what Django thinks the paths should be
    designs = Design.objects.all()
    print("Django's calculated paths:")
    for design in designs[:3]:
        if design.video:
            try:
                print(f"  Design {design.id}: {design.video.url}")
                print(f"    File path: {design.video.path}")
                print(f"    File name: {design.video.name}")
                exists = os.path.exists(design.video.path) if design.video.path else False
                print(f"    Exists: {exists}")
            except Exception as e:
                print(f"  Design {design.id}: ERROR - {e}")

def main():
    investigate_production_database()
    check_filesystem_vs_database()
    
    print("\n🎯 ROOT CAUSE ANALYSIS:")
    print("=" * 30)
    print("The issue is that database fields have 'media/' prefix stored.")
    print("When Django generates URLs, it adds MEDIA_URL ('/media/') to the field value.")
    print("This creates '/media/media/...' which causes 404s and FileNotFoundError.")
    print()
    print("SOLUTION NEEDED:")
    print("1. Remove 'media/' prefix from all file fields in database")
    print("2. Ensure media files exist on filesystem")
    print("3. Fix admin validation to handle missing files gracefully")

if __name__ == "__main__":
    main()
