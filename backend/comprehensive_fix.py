#!/usr/bin/env python3
"""
Comprehensive production fix for duplicate media paths
This will fix ALL tables that have file fields
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.db import connection

def fix_all_duplicate_paths():
    """Fix duplicate media paths in all relevant tables"""
    print("🔧 COMPREHENSIVE PRODUCTION MEDIA PATH FIX")
    print("=" * 50)
    
    with connection.cursor() as cursor:
        fixes = []
        
        # Fix store_design video field
        cursor.execute("""
            UPDATE store_design 
            SET video = REPLACE(video, 'media/', '') 
            WHERE video LIKE 'media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Design videos: {cursor.rowcount}")
        
        # Fix store_designimage image field  
        cursor.execute("""
            UPDATE store_designimage 
            SET image = REPLACE(image, 'media/', '') 
            WHERE image LIKE 'media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Design images: {cursor.rowcount}")
        
        # Fix store_video video_file field
        cursor.execute("""
            UPDATE store_video 
            SET video_file = REPLACE(video_file, 'media/', '') 
            WHERE video_file LIKE 'media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Video files: {cursor.rowcount}")
        
        # Fix store_video thumbnail field
        cursor.execute("""
            UPDATE store_video 
            SET thumbnail = REPLACE(thumbnail, 'media/', '') 
            WHERE thumbnail LIKE 'media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Video thumbnails: {cursor.rowcount}")
        
        # Fix store_collection featured_image field
        cursor.execute("""
            UPDATE store_collection 
            SET featured_image = REPLACE(featured_image, 'media/', '') 
            WHERE featured_image LIKE 'media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Collection images: {cursor.rowcount}")
        
        # Fix store_siteasset file field
        cursor.execute("""
            UPDATE store_siteasset 
            SET file = REPLACE(file, 'media/', '') 
            WHERE file LIKE 'media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Site assets: {cursor.rowcount}")
        
        # Fix store_blogpostmedia file field
        cursor.execute("""
            UPDATE store_blogpostmedia 
            SET file = REPLACE(file, 'media/', '') 
            WHERE file LIKE 'media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Blog media: {cursor.rowcount}")
        
        # Fix store_businessprofile ceo_photo field
        cursor.execute("""
            UPDATE store_businessprofile 
            SET ceo_photo = REPLACE(ceo_photo, 'media/', '') 
            WHERE ceo_photo LIKE 'media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"CEO photos: {cursor.rowcount}")
        
        # Fix store_blogpost cover_image field
        cursor.execute("""
            UPDATE store_blogpost 
            SET cover_image = REPLACE(cover_image, 'media/', '') 
            WHERE cover_image LIKE 'media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Blog covers: {cursor.rowcount}")
        
        # Also handle paths starting with '/media/'
        cursor.execute("""
            UPDATE store_design 
            SET video = REPLACE(video, '/media/', '') 
            WHERE video LIKE '/media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Design videos (slash): {cursor.rowcount}")
        
        cursor.execute("""
            UPDATE store_designimage 
            SET image = REPLACE(image, '/media/', '') 
            WHERE image LIKE '/media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Design images (slash): {cursor.rowcount}")
        
        cursor.execute("""
            UPDATE store_siteasset 
            SET file = REPLACE(file, '/media/', '') 
            WHERE file LIKE '/media/%'
        """)
        if cursor.rowcount > 0:
            fixes.append(f"Site assets (slash): {cursor.rowcount}")
        
        print("✅ Fixes applied:")
        for fix in fixes:
            print(f"  - {fix}")
        
        if not fixes:
            print("✅ No duplicate paths found - database is clean!")
        
        return len(fixes)

def verify_fixes():
    """Verify that the fixes worked"""
    print("\n🔍 VERIFYING FIXES...")
    
    with connection.cursor() as cursor:
        # Check for any remaining problematic paths
        cursor.execute("""
            SELECT 'store_design' as table_name, 'video' as field_name, COUNT(*) as count
            FROM store_design WHERE video LIKE 'media/%' OR video LIKE '/media/%'
            UNION ALL
            SELECT 'store_designimage', 'image', COUNT(*)
            FROM store_designimage WHERE image LIKE 'media/%' OR image LIKE '/media/%'
            UNION ALL
            SELECT 'store_siteasset', 'file', COUNT(*)
            FROM store_siteasset WHERE file LIKE 'media/%' OR file LIKE '/media/%'
        """)
        
        problems = cursor.fetchall()
        
        total_problems = sum(row[2] for row in problems)
        
        if total_problems == 0:
            print("✅ All paths are now correct!")
        else:
            print(f"⚠️  Found {total_problems} remaining issues:")
            for table, field, count in problems:
                if count > 0:
                    print(f"  - {table}.{field}: {count} problematic paths")
        
        return total_problems == 0

def main():
    print("Starting comprehensive media path fix...")
    
    # Apply fixes
    fix_count = fix_all_duplicate_paths()
    
    # Verify fixes
    is_clean = verify_fixes()
    
    if is_clean:
        print("\n🎉 SUCCESS: All media paths have been fixed!")
        print("The duplicate /media/media/ issue should now be resolved.")
    else:
        print("\n⚠️  Some issues remain - manual intervention may be needed")
    
    return is_clean

if __name__ == "__main__":
    main()
