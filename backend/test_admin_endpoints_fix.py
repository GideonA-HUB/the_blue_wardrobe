#!/usr/bin/env python
"""
Test script to verify admin endpoints work after video field fix
"""
import os
import sys

# Setup Django FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
import django
django.setup()

# Now import after Django is setup
from django.test import RequestFactory
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

from store.models import Design, Collection
from store.serializers import DesignSerializer, CollectionSerializer
from store.views import AdminDesignViewSet, AdminCollectionViewSet

def test_admin_designs_endpoint():
    print("Testing Admin Designs endpoint...")
    
    # Create a mock request
    factory = APIRequestFactory()
    request = factory.get('/api/admin/designs/')
    request = Request(request)
    
    try:
        # Test the viewset
        viewset = AdminDesignViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Get queryset
        queryset = viewset.get_queryset()
        print(f"✅ Admin designs queryset retrieved: {queryset.count()} designs")
        
        # Test serialization - this is where the video field error occurred
        serializer = DesignSerializer(queryset, many=True, context={'request': request})
        data = serializer.data
        print(f"✅ Admin designs endpoint: {len(data)} designs serialized successfully")
        
        # Check each design's video_url
        for design_data in data:
            video_url = design_data.get('video_url')
            print(f"   - Design {design_data.get('sku', 'N/A')}: video_url = {video_url}")
        
    except Exception as e:
        print(f"❌ Error testing admin designs endpoint: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("✅ Admin designs endpoint working correctly!")
    return True

def test_admin_collections_endpoint():
    print("\nTesting Admin Collections endpoint...")
    
    # Create a mock request
    factory = APIRequestFactory()
    request = factory.get('/api/admin/collections/')
    request = Request(request)
    
    try:
        # Test the viewset
        viewset = AdminCollectionViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Get queryset
        queryset = viewset.get_queryset()
        print(f"✅ Admin collections queryset retrieved: {queryset.count()} collections")
        
        # Test serialization - this should work without video field issues
        serializer = CollectionSerializer(queryset, many=True, context={'request': request})
        data = serializer.data
        print(f"✅ Admin collections endpoint: {len(data)} collections serialized successfully")
        
    except Exception as e:
        print(f"❌ Error testing admin collections endpoint: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("✅ Admin collections endpoint working correctly!")
    return True

def test_video_field_directly():
    print("\nTesting video field access directly...")
    
    try:
        # Get all designs
        designs = Design.objects.all()
        print(f"Found {designs.count()} designs")
        
        for design in designs:
            # Test video field access - this was causing the AttributeError
            video_value = design.video
            print(f"   - Design {design.sku}: video = {video_value} (type: {type(video_value)})")
            
            # Test serialization of individual design
            serializer = DesignSerializer(design)
            data = serializer.data
            video_url = data.get('video_url')
            print(f"     Serialized video_url: {video_url}")
        
    except Exception as e:
        print(f"❌ Error testing video field directly: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("✅ Video field access working correctly!")
    return True

if __name__ == '__main__':
    print("=" * 70)
    print("TESTING ADMIN ENDPOINTS AFTER VIDEO FIELD FIX")
    print("=" * 70)
    
    success = True
    success &= test_admin_designs_endpoint()
    success &= test_admin_collections_endpoint()
    success &= test_video_field_directly()
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 ALL ADMIN ENDPOINTS WORKING CORRECTLY!")
        print("The video field AttributeError has been resolved.")
    else:
        print("❌ ADMIN ENDPOINTS STILL HAVE ISSUES!")
        print("Please check the errors above.")
    print("=" * 70)
    
    sys.exit(0 if success else 1)
