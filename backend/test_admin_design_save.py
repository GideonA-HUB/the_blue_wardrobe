#!/usr/bin/env python
"""
Test script to verify Django admin can save designs without video field errors
"""
import os
import sys

# Setup Django FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
import django
django.setup()

# Now import after Django is setup
from django.test import TestCase
from django.contrib.auth.models import User
from store.models import Design, Collection

def test_admin_design_save():
    print("Testing Django admin design save functionality...")
    
    try:
        # Get or create a superuser for testing
        user, created = User.objects.get_or_create(
            username='testadmin',
            defaults={
                'email': 'admin@test.com',
                'is_superuser': True,
                'is_staff': True
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            print("✅ Created test superuser")
        
        # Get or create a collection
        collection, created = Collection.objects.get_or_create(
            code='TEST',
            defaults={
                'title': 'Test Collection',
                'story': 'Test story for admin functionality'
            }
        )
        if created:
            print("✅ Created test collection")
        
        # Create a test design with unique SKU
        import uuid
        unique_sku = f'TEST-{uuid.uuid4().hex[:8]}'
        design = Design.objects.create(
            collection=collection,
            sku=unique_sku,
            title='Test Design for Admin',
            description='Test description',
            price=5000.00,
            video=None  # Explicitly set to None to avoid issues
        )
        print(f"✅ Created test design: {design.sku}")
        
        # Test saving the design (simulating admin save)
        design.title = 'Updated Test Design for Admin'
        design.description = 'Updated description'
        design.save()
        print(f"✅ Successfully saved design: {design.sku}")
        
        # Test saving with video field as string (should be handled gracefully)
        design.video = 'invalid_string_data'  # This should be handled by our save method
        design.save()
        print(f"✅ Successfully saved design with invalid video data (handled gracefully)")
        
        # Verify video field is now None
        design.refresh_from_db()
        if design.video is None:
            print("✅ Video field correctly set to None after invalid data")
        else:
            print(f"❌ Video field still has data: {design.video}")
            return False
        
        # Test deleting the design
        design.delete()
        print("✅ Successfully deleted test design")
        
        print("\n🎉 ALL ADMIN SAVE TESTS PASSED!")
        print("The Django admin should now work correctly for design editing.")
        return True
        
    except Exception as e:
        print(f"❌ Error testing admin design save: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("=" * 70)
    print("TESTING DJANGO ADMIN DESIGN SAVE FUNCTIONALITY")
    print("=" * 70)
    
    success = test_admin_design_save()
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 ADMIN SAVE FUNCTIONALITY WORKING CORRECTLY!")
        print("The video field issues have been resolved.")
    else:
        print("❌ ADMIN SAVE FUNCTIONALITY STILL HAS ISSUES!")
        print("Please check the errors above.")
    print("=" * 70)
    
    sys.exit(0 if success else 1)
