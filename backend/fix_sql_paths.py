#!/usr/bin/env python3
"""
Direct SQL fix for duplicate media paths in production
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.db import connection

def fix_paths_with_sql():
    """Fix duplicate media paths using direct SQL"""
    print("🔧 FIXING DUPLICATE PATHS WITH SQL...")
    
    with connection.cursor() as cursor:
        # Fix store_design video field
        cursor.execute("""
            UPDATE store_design 
            SET video = REPLACE(video, 'media/', '') 
            WHERE video LIKE 'media/%'
        """)
        design_count = cursor.rowcount
        print(f"✅ Fixed {design_count} design video paths")
        
        # Fix store_designimage image field  
        cursor.execute("""
            UPDATE store_designimage 
            SET image = REPLACE(image, 'media/', '') 
            WHERE image LIKE 'media/%'
        """)
        image_count = cursor.rowcount
        print(f"✅ Fixed {image_count} design image paths")
        
        # Fix store_video video_file field
        cursor.execute("""
            UPDATE store_video 
            SET video_file = REPLACE(video_file, 'media/', '') 
            WHERE video_file LIKE 'media/%'
        """)
        video_file_count = cursor.rowcount
        print(f"✅ Fixed {video_file_count} video file paths")
        
        # Fix store_video thumbnail field
        cursor.execute("""
            UPDATE store_video 
            SET thumbnail = REPLACE(thumbnail, 'media/', '') 
            WHERE thumbnail LIKE 'media/%'
        """)
        thumbnail_count = cursor.rowcount
        print(f"✅ Fixed {thumbnail_count} thumbnail paths")
        
        # Fix store_collection featured_image field
        cursor.execute("""
            UPDATE store_collection 
            SET featured_image = REPLACE(featured_image, 'media/', '') 
            WHERE featured_image LIKE 'media/%'
        """)
        collection_count = cursor.rowcount
        print(f"✅ Fixed {collection_count} collection image paths")
        
        # Fix store_siteasset file field
        cursor.execute("""
            UPDATE store_siteasset 
            SET file = REPLACE(file, 'media/', '') 
            WHERE file LIKE 'media/%'
        """)
        asset_count = cursor.rowcount
        print(f"✅ Fixed {asset_count} site asset paths")
        
        total_fixed = design_count + image_count + video_file_count + thumbnail_count + collection_count + asset_count
        
        print(f"\n🎉 TOTAL FIXED: {total_fixed} paths")
        return total_fixed

if __name__ == "__main__":
    total = fix_paths_with_sql()
    if total > 0:
        print(f"\n✅ SUCCESS: Fixed {total} duplicate media paths!")
    else:
        print("\n✅ No duplicate paths found!")
