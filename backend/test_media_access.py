#!/usr/bin/env python3
"""
Test script to verify media file serving
"""
import os
import sys
import django
import requests
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from store.models import DesignImage, Design

def test_media_file_access():
    """Test if media files can be accessed via HTTP"""
    print("🧪 Testing Media File Access...")
    
    # Get the base URL from environment or use default
    base_url = os.getenv('BASE_URL', 'http://localhost:8080')
    
    # Test DesignImage files
    images = DesignImage.objects.all()
    if not images:
        print("⚠️  No DesignImage objects found to test")
        return False
    
    print(f"Found {len(images)} DesignImage objects")
    
    for image in images[:3]:  # Test first 3 images
        if image.image:
            image_url = image.image.url
            full_url = f"{base_url}{image_url}"
            
            print(f"Testing: {full_url}")
            
            try:
                response = requests.head(full_url, timeout=10)
                if response.status_code == 200:
                    print(f"✅ Accessible: {image_url}")
                else:
                    print(f"❌ Not accessible: {image_url} (Status: {response.status_code})")
            except requests.exceptions.RequestException as e:
                print(f"❌ Request failed: {image_url} - {e}")
    
    return True

def test_local_file_paths():
    """Test local file paths"""
    print("\n🧪 Testing Local File Paths...")
    
    media_root = settings.MEDIA_ROOT
    print(f"Media root: {media_root}")
    print(f"Media URL: {settings.MEDIA_URL}")
    
    # Test DesignImage files
    images = DesignImage.objects.all()
    
    for image in images[:3]:  # Test first 3 images
        if image.image:
            image_path = str(image.image.path)
            print(f"Image path: {image_path}")
            
            if os.path.exists(image_path):
                print(f"✅ File exists: {image_path}")
                file_size = os.path.getsize(image_path)
                print(f"   Size: {file_size} bytes")
            else:
                print(f"❌ File missing: {image_path}")
    
    return True

def test_url_configuration():
    """Test URL configuration"""
    print("\n🧪 Testing URL Configuration...")
    
    from django.urls import reverse
    from django.test import Client
    
    client = Client()
    
    # Test if media URL pattern is configured
    try:
        # Try to access a media file URL directly
        response = client.get('/media/')
        print(f"Media root response: {response.status_code}")
    except Exception as e:
        print(f"Media URL test error: {e}")
    
    # Check URL patterns
    from django.urls import get_resolver
    resolver = get_resolver()
    
    print("URL patterns containing 'media':")
    for pattern in resolver.url_patterns:
        if hasattr(pattern, 'pattern') and 'media' in str(pattern.pattern):
            print(f"  - {pattern.pattern}")
    
    return True

def main():
    """Main function"""
    print("🚀 Starting Media File Access Test...\n")
    
    try:
        test_local_file_paths()
        test_url_configuration()
        test_media_file_access()
        
        print("\n🎉 Media file access test completed!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
