#!/usr/bin/env python
"""
Test script to verify the API endpoints are working correctly
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
from store.views import DesignViewSet, CollectionViewSet

def test_design_api_endpoint():
    print("Testing Design API endpoint...")
    
    # Create a mock request
    factory = APIRequestFactory()
    request = factory.get('/api/designs/')
    request = Request(request)
    
    try:
        # Test the viewset
        viewset = DesignViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Get queryset
        queryset = viewset.get_queryset()
        print(f"✅ Design queryset retrieved: {queryset.count()} designs")
        
        # Test serialization
        for design in queryset:
            serializer = DesignSerializer(design, context={'request': request})
            data = serializer.data
            print(f"✅ Design '{design.title}' serialized successfully")
            print(f"   - Video URL: {data.get('video_url')}")
            print(f"   - Reviews count: {data.get('total_reviews')}")
            
    except Exception as e:
        print(f"❌ Error testing design API: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("✅ Design API endpoint working correctly!")
    return True

def test_collection_api_endpoint():
    print("\nTesting Collection API endpoint...")
    
    # Create a mock request
    factory = APIRequestFactory()
    request = factory.get('/api/collections/')
    request = Request(request)
    
    try:
        # Test the viewset
        viewset = CollectionViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Get queryset
        queryset = viewset.get_queryset()
        print(f"✅ Collection queryset retrieved: {queryset.count()} collections")
        
        # Test serialization
        for collection in queryset:
            serializer = CollectionSerializer(collection, context={'request': request})
            data = serializer.data
            print(f"✅ Collection '{collection.title}' serialized successfully")
            print(f"   - Designs count: {len(data.get('designs', []))}")
            
    except Exception as e:
        print(f"❌ Error testing collection API: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("✅ Collection API endpoint working correctly!")
    return True

def test_admin_endpoints():
    print("\nTesting Admin endpoints...")
    
    # Create a mock request
    factory = APIRequestFactory()
    request = factory.get('/api/admin/designs/')
    request = Request(request)
    
    try:
        # Test admin design endpoint
        viewset = DesignViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        viewset.action = 'list'
        
        queryset = viewset.get_queryset()
        serializer = DesignSerializer(queryset, many=True, context={'request': request})
        data = serializer.data
        print(f"✅ Admin designs endpoint: {len(data)} designs serialized")
        
        # Test admin collection endpoint
        viewset = CollectionViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        viewset.action = 'list'
        
        queryset = viewset.get_queryset()
        serializer = CollectionSerializer(queryset, many=True, context={'request': request})
        data = serializer.data
        print(f"✅ Admin collections endpoint: {len(data)} collections serialized")
        
    except Exception as e:
        print(f"❌ Error testing admin endpoints: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("✅ Admin endpoints working correctly!")
    return True

if __name__ == '__main__':
    print("=" * 70)
    print("TESTING API ENDPOINTS AFTER VIDEO URL FIX")
    print("=" * 70)
    
    success = True
    success &= test_design_api_endpoint()
    success &= test_collection_api_endpoint()
    success &= test_admin_endpoints()
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 ALL API ENDPOINTS WORKING CORRECTLY!")
        print("The video URL fix has resolved the 500 errors.")
    else:
        print("❌ SOME API ENDPOINTS STILL HAVE ISSUES!")
        print("Please check the errors above.")
    print("=" * 70)
    
    sys.exit(0 if success else 1)
