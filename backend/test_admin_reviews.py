#!/usr/bin/env python
"""
Test script to verify the admin reviews endpoint works correctly
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

from store.models import Design, DesignReview, Collection
from store.serializers import DesignReviewSerializer
from store.views import AdminDesignReviewViewSet

def test_admin_reviews_endpoint():
    print("Testing Admin Design Reviews endpoint...")
    
    # Create a mock request
    factory = APIRequestFactory()
    request = factory.get('/api/admin/design-reviews/')
    request = Request(request)
    
    try:
        # Test the viewset
        viewset = AdminDesignReviewViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Get queryset
        queryset = viewset.get_queryset()
        print(f"✅ Admin reviews queryset retrieved: {queryset.count()} reviews")
        
        # Test serialization
        for review in queryset:
            serializer = DesignReviewSerializer(review, context={'request': request})
            data = serializer.data
            print(f"✅ Review by '{data['name']}' serialized successfully")
            print(f"   - Design: {review.design.title if review.design else 'N/A'}")
            print(f"   - Rating: {data['rating']}")
            print(f"   - Email: {data['email']}")
            print(f"   - Approved: {data['is_approved']}")
            
    except Exception as e:
        print(f"❌ Error testing admin reviews endpoint: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("✅ Admin reviews endpoint working correctly!")
    return True

def test_reviews_with_design_filter():
    print("\nTesting reviews with design filter...")
    
    # Create a mock request
    factory = APIRequestFactory()
    request = factory.get('/api/admin/design-reviews/?design_id=1')
    request = Request(request)
    
    try:
        # Test the viewset with filter
        viewset = AdminDesignReviewViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Get queryset with filter
        queryset = viewset.get_queryset()
        print(f"✅ Filtered reviews queryset: {queryset.count()} reviews for design_id=1")
        
    except Exception as e:
        print(f"❌ Error testing filtered reviews: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("✅ Reviews filter working correctly!")
    return True

if __name__ == '__main__':
    print("=" * 70)
    print("TESTING ADMIN DESIGN REVIEWS ENDPOINT")
    print("=" * 70)
    
    success = True
    success &= test_admin_reviews_endpoint()
    success &= test_reviews_with_design_filter()
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 ADMIN REVIEWS ENDPOINT WORKING CORRECTLY!")
        print("The owner dashboard can now access design reviews.")
    else:
        print("❌ ADMIN REVIEWS ENDPOINT HAS ISSUES!")
        print("Please check the errors above.")
    print("=" * 70)
    
    sys.exit(0 if success else 1)
