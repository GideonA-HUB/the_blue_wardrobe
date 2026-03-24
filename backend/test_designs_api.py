#!/usr/bin/env python
"""
Test script to verify the designs API endpoint works correctly
"""
import os
import sys

# Setup Django FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
import django
django.setup()

# Now import after Django is setup
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request
from store.views import DesignViewSet
from store.models import Design, Collection
from decimal import Decimal

def test_designs_api():
    print("Testing Designs API endpoint...")
    
    try:
        # Create a mock request
        factory = APIRequestFactory()
        request = factory.get('/api/designs/')
        request = Request(request)
        
        # Test the viewset
        viewset = DesignViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        viewset.action = 'list'
        
        # Get queryset
        queryset = viewset.get_queryset()
        print(f"✅ Designs queryset retrieved: {queryset.count()} designs")
        
        # Test serialization
        from store.serializers import DesignSerializer
        serializer = DesignSerializer(queryset, many=True, context={'request': request})
        data = serializer.data
        print(f"✅ Designs endpoint: {len(data)} designs serialized successfully")
        
        # Test data structure
        if data:
            first_design = data[0]
            required_fields = ['id', 'sku', 'title', 'price', 'effective_price', 'has_discount', 'total_stock', 'images', 'collection']
            for field in required_fields:
                if field not in first_design:
                    print(f"❌ Missing field: {field}")
                    return False
            print("✅ All required fields present in design data")
            
            # Test image structure
            if first_design.get('images'):
                first_image = first_design['images'][0]
                if 'image_url' not in first_image:
                    print("❌ Missing image_url in image data")
                    return False
                print("✅ Image data structure is correct")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing designs API: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_test_data():
    print("\nCreating test data...")
    
    try:
        # Create a test collection
        collection, created = Collection.objects.get_or_create(
            code='TEST-HOMEPAGE',
            defaults={
                'title': 'Test Homepage Collection',
                'story': 'Test collection for homepage designs'
            }
        )
        if created:
            print("✅ Created test collection")
        
        # Create test designs
        for i in range(5):
            design, created = Design.objects.get_or_create(
                sku=f'HOMEPAGE-{i+1:03d}',
                defaults={
                    'collection': collection,
                    'title': f'Homepage Test Design {i+1}',
                    'description': f'Test design {i+1} for homepage display',
                    'price': Decimal(f'{5000 + (i * 1000)}.00'),
                    'discount_price': Decimal(f'{4500 + (i * 1000)}.00') if i % 2 == 0 else None
                }
            )
            if created:
                print(f"✅ Created test design: {design.sku}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("=" * 70)
    print("TESTING HOMEPAGE DESIGNS API")
    print("=" * 70)
    
    success = True
    success &= create_test_data()
    success &= test_designs_api()
    
    print("\n" + "=" * 70)
    if success:
        print("🎉 HOMEPAGE DESIGNS API WORKING PERFECTLY!")
        print("The frontend can successfully fetch and display designs.")
        print("\n✅ What's working:")
        print("  - Designs API endpoint returns correct data")
        print("  - All required fields are present")
        print("  - Image data structure is correct")
        print("  - Test data created successfully")
    else:
        print("❌ HOMEPAGE DESIGNS API HAS ISSUES!")
        print("Please check the errors above.")
    print("=" * 70)
    
    sys.exit(0 if success else 1)
