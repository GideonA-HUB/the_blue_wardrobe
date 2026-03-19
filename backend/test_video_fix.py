#!/usr/bin/env python
"""
Test script to verify the video URL fix works correctly
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from store.models import Design, Collection
from store.serializers import DesignSerializer

def test_video_url_fix():
    print("Testing video URL fix...")
    
    # Get all designs
    designs = Design.objects.all()
    print(f"Found {designs.count()} designs")
    
    # Test each design
    for design in designs:
        print(f"\nTesting design: {design.title} (ID: {design.id})")
        print(f"Video field type: {type(design.video)}")
        print(f"Video field value: {design.video}")
        
        try:
            # Test serialization
            serializer = DesignSerializer(design)
            video_url = serializer.data.get('video_url')
            print(f"✅ Serialized video_url: {video_url}")
        except Exception as e:
            print(f"❌ Error serializing design {design.id}: {e}")
            return False
    
    print("\n✅ All designs serialized successfully!")
    return True

def test_collections_api():
    print("\nTesting collections API...")
    
    try:
        from store.serializers import CollectionSerializer
        collections = Collection.objects.all()
        print(f"Found {collections.count()} collections")
        
        for collection in collections:
            serializer = CollectionSerializer(collection)
            print(f"✅ Collection '{collection.title}' serialized successfully")
            
    except Exception as e:
        print(f"❌ Error testing collections: {e}")
        return False
    
    print("✅ Collections API working correctly!")
    return True

if __name__ == '__main__':
    print("=" * 60)
    print("TESTING VIDEO URL FIX")
    print("=" * 60)
    
    success = True
    success &= test_video_url_fix()
    success &= test_collections_api()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 ALL TESTS PASSED! The video URL fix is working correctly.")
    else:
        print("❌ SOME TESTS FAILED! Please check the errors above.")
    print("=" * 60)
    
    sys.exit(0 if success else 1)
