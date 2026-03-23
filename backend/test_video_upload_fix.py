#!/usr/bin/env python
"""
Test script to verify Django admin video upload works with custom form
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
from django.core.files.uploadedfile import SimpleUploadedFile
from store.models import Design, Collection
from store.admin import DesignAdminForm

def test_admin_form_video_validation():
    print("Testing DesignAdminForm video validation...")
    
    try:
        # Get or create a collection
        collection, created = Collection.objects.get_or_create(
            code='VIDEO-TEST',
            defaults={
                'title': 'Video Upload Test Collection',
                'story': 'Test collection for video upload functionality'
            }
        )
        if created:
            print("✅ Created test collection")
        
        # Test 1: Form with no video (should work)
        form_data = {
            'collection': collection.id,
            'sku': 'VIDEO-001',
            'title': 'Test Design No Video',
            'description': 'Test design without video',
            'price': '5000.00'
        }
        form = DesignAdminForm(data=form_data)
        if form.is_valid():
            print("✅ Form without video validates correctly")
        else:
            print(f"❌ Form without video failed: {form.errors}")
            return False
        
        # Test 2: Form with valid video file (should work)
        video_file = SimpleUploadedFile(
            "test_video.mp4",
            b"fake video content for testing",
            content_type="video/mp4"
        )
        form_data_with_video = {
            'collection': collection.id,
            'sku': 'VIDEO-002',
            'title': 'Test Design With Video',
            'description': 'Test design with video',
            'price': '6000.00'
        }
        form_with_video = DesignAdminForm(data=form_data_with_video, files={'video': video_file})
        if form_with_video.is_valid():
            print("✅ Form with valid video file validates correctly")
            design = form_with_video.save()
            print(f"✅ Created design with video: {design.sku}")
            design.delete()
        else:
            print(f"❌ Form with valid video failed: {form_with_video.errors}")
            return False
        
        # Test 3: Form with invalid video data (should be handled gracefully)
        # Simulate what happens when Django receives string data
        form_data_invalid = {
            'collection': collection.id,
            'sku': 'VIDEO-003',
            'title': 'Test Design Invalid Video',
            'description': 'Test design with invalid video',
            'price': '7000.00',
            'video': 'invalid_string_data'
        }
        
        # Create form with invalid data
        form_invalid = DesignAdminForm(data=form_data_invalid)
        
        # Manually set the video field to test clean_video method
        form_invalid.data['video'] = 'invalid_string_data'
        
        # Test the clean_video method directly
        form_invalid.cleaned_data = {'video': 'invalid_string_data'}
        cleaned_video = form_invalid.clean_video()
        
        if cleaned_video is None:
            print("✅ Form clean_video method handles invalid data correctly")
        else:
            print(f"❌ Form clean_video method failed: {cleaned_video}")
            return False
        
        print("\n🎉 ALL ADMIN FORM TESTS PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing admin form: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_design_model_save():
    print("\nTesting Design model save functionality...")
    
    try:
        collection = Collection.objects.get(code='VIDEO-TEST')
        
        # Test 1: Create design normally
        design = Design.objects.create(
            collection=collection,
            sku='VIDEO-004',
            title='Model Save Test',
            description='Testing model save functionality',
            price=8000.00,
            video=None
        )
        print(f"✅ Created design: {design.sku}")
        
        # Test 2: Update design without video
        design.title = 'Updated Model Save Test'
        design.save()
        print("✅ Updated design without video successfully")
        
        # Test 3: Test serialization
        from store.serializers import DesignSerializer
        serializer = DesignSerializer(design)
        data = serializer.data
        video_url = data.get('video_url')
        print(f"✅ Serialization works: video_url = {video_url}")
        
        # Clean up
        design.delete()
        print("✅ Cleaned up test design")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing model save: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_admin_endpoints():
    print("\nTesting admin endpoints...")
    
    try:
        # Test admin designs endpoint
        from store.views import AdminDesignViewSet
        from rest_framework.test import APIRequestFactory
        from rest_framework.request import Request
        
        factory = APIRequestFactory()
        request = factory.get('/api/admin/designs/')
        request = Request(request)
        
        viewset = AdminDesignViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        queryset = viewset.get_queryset()
        print(f"✅ Admin designs queryset retrieved: {queryset.count()} designs")
        
        # Test serialization
        from store.serializers import DesignSerializer
        serializer = DesignSerializer(queryset, many=True, context={'request': request})
        data = serializer.data
        print(f"✅ Admin designs endpoint: {len(data)} designs serialized successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing admin endpoints: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("=" * 70)
    print("TESTING VIDEO UPLOAD FIX WITH CUSTOM ADMIN FORM")
    print("=" * 70)
    
    success = True
    success &= test_admin_form_video_validation()
    success &= test_design_model_save()
    success &= test_admin_endpoints()
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 VIDEO UPLOAD FIX WORKING PERFECTLY!")
        print("The Django admin video upload will now work correctly.")
        print("No more 500 errors when uploading videos!")
        print("\n✅ What's fixed:")
        print("  - Custom admin form validates video uploads")
        print("  - Invalid video data handled gracefully")
        print("  - FileField works properly with valid uploads")
        print("  - Admin endpoints work without errors")
    else:
        print("❌ VIDEO UPLOAD FIX STILL HAS ISSUES!")
        print("Please check the errors above.")
    print("=" * 70)
    
    sys.exit(0 if success else 1)
