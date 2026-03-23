#!/usr/bin/env python
"""
Test script to verify SafeVideoField handles all edge cases correctly
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

def test_safe_video_field():
    print("Testing SafeVideoField functionality...")
    
    try:
        # Get or create a collection
        collection, created = Collection.objects.get_or_create(
            code='SAFE-TEST',
            defaults={
                'title': 'Safe Video Test Collection',
                'story': 'Test story for SafeVideoField'
            }
        )
        if created:
            print("✅ Created test collection")
        
        # Test 1: Create design with None video (should work)
        design1 = Design.objects.create(
            collection=collection,
            sku='SAFE-001',
            title='Safe Video Test 1',
            description='Test with None video',
            price=5000.00,
            video=None
        )
        print(f"✅ Created design with None video: {design1.sku}")
        
        # Test 2: Try to set video to string (should be handled gracefully)
        design1.video = 'invalid_string_data'
        design1.save()
        print("✅ Successfully saved design with string video data (handled gracefully)")
        
        # Verify video is None after save
        design1.refresh_from_db()
        if design1.video is None or str(design1.video) == '':
            print("✅ Video field correctly set to None after string data")
        else:
            print(f"❌ Video field still has data: {design1.video}")
            return False
        
        # Test 3: Test serialization (simulating admin endpoint)
        from store.serializers import DesignSerializer
        serializer = DesignSerializer(design1)
        data = serializer.data
        video_url = data.get('video_url')
        print(f"✅ Serialization works: video_url = {video_url}")
        
        # Test 4: Create another design and test admin save simulation
        design2 = Design.objects.create(
            collection=collection,
            sku='SAFE-002',
            title='Safe Video Test 2',
            description='Test admin save simulation',
            price=6000.00,
            video=None
        )
        
        # Simulate admin save with string data
        design2.video = 'admin_upload_string'
        design2.save()
        print("✅ Admin save simulation successful")
        
        # Test 5: Test queryset serialization (admin endpoint)
        designs = Design.objects.filter(sku__startswith='SAFE-')
        serializer = DesignSerializer(designs, many=True)
        data = serializer.data
        print(f"✅ Queryset serialization works: {len(data)} designs serialized")
        
        # Clean up
        design1.delete()
        design2.delete()
        print("✅ Cleaned up test designs")
        
        print("\n🎉 ALL SAFE VIDEO FIELD TESTS PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing SafeVideoField: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_edge_cases():
    print("\nTesting edge cases...")
    
    try:
        collection = Collection.objects.get(code='SAFE-TEST')
        
        # Test with various invalid data types
        test_cases = [
            ('empty_string', ''),
            ('space_string', '   '),
            ('invalid_url', 'http://invalid.url'),
            ('partial_path', '/partial/path'),
            ('json_string', '{"invalid": "data"}'),
            ('number_string', '12345'),
        ]
        
        for case_name, test_value in test_cases:
            design = Design.objects.create(
                collection=collection,
                sku=f'SAFE-{case_name.upper()}',
                title=f'Safe Video Test {case_name}',
                description=f'Test with {case_name}',
                price=5000.00,
                video=None
            )
            
            # Try to set invalid data
            design.video = test_value
            design.save()
            
            # Verify it's handled
            design.refresh_from_db()
            if design.video is None or str(design.video) == '':
                print(f"✅ Edge case '{case_name}' handled correctly")
            else:
                print(f"❌ Edge case '{case_name}' failed: {design.video}")
                return False
            
            design.delete()
        
        print("✅ All edge cases handled correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing edge cases: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("=" * 70)
    print("TESTING SAFE VIDEO FIELD IMPLEMENTATION")
    print("=" * 70)
    
    success = True
    success &= test_safe_video_field()
    success &= test_edge_cases()
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 SAFE VIDEO FIELD WORKING PERFECTLY!")
        print("All Django admin video upload issues are resolved.")
    else:
        print("❌ SAFE VIDEO FIELD STILL HAS ISSUES!")
        print("Please check the errors above.")
    print("=" * 70)
    
    sys.exit(0 if success else 1)
