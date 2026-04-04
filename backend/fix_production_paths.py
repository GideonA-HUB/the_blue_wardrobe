#!/usr/bin/env python3
"""
Production script to fix duplicate media paths
Run this in production via Railway shell or add to entrypoint
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from django.db import transaction
from store.models import Design

def fix_production_video_paths():
    """Fix video paths in production database"""
    print("🔧 FIXING PRODUCTION VIDEO PATHS...")
    
    with transaction.atomic():
        designs = Design.objects.all()
        print(f"Found {designs.count()} designs")
        
        for design in designs:
            print(f"\nDesign {design.id}: {design.sku}")
            
            if design.video:
                print(f"  Current video name: {design.video.name}")
                
                # Fix paths that start with 'media/'
                if design.video.name and design.video.name.startswith('media/'):
                    old_name = design.video.name
                    new_name = design.video.name[5:]  # Remove 'media/' prefix
                    
                    # Update the field name directly
                    design.video.name = new_name
                    design.save(update_fields=['video'])
                    
                    print(f"  ✅ Fixed: {old_name} -> {new_name}")
                else:
                    print(f"  ✅ Already correct: {design.video.name}")
            else:
                print(f"  No video file")

if __name__ == "__main__":
    fix_production_video_paths()
    print("\n🎉 Production video paths fixed!")
