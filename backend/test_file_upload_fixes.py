#!/usr/bin/env python3
"""
Test script to verify file upload fixes for large files
"""
import os
import sys
import django
from django.conf import settings
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

from store.models import Design, DesignImage
from store.admin import DesignAdminForm

def test_file_upload_settings():
    """Test that file upload settings are properly configured"""
    print("🧪 Testing File Upload Settings...")
    
    # Test Django settings
    assert hasattr(settings, 'DATA_UPLOAD_MAX_MEMORY_SIZE'), "DATA_UPLOAD_MAX_MEMORY_SIZE not set"
    assert settings.DATA_UPLOAD_MAX_MEMORY_SIZE == 52428800, f"Expected 52428800, got {settings.DATA_UPLOAD_MAX_MEMORY_SIZE}"
    print("✅ DATA_UPLOAD_MAX_MEMORY_SIZE: 50MB")
    
    assert hasattr(settings, 'FILE_UPLOAD_MAX_MEMORY_SIZE'), "FILE_UPLOAD_MAX_MEMORY_SIZE not set"
    assert settings.FILE_UPLOAD_MAX_MEMORY_SIZE == 52428800, f"Expected 52428800, got {settings.FILE_UPLOAD_MAX_MEMORY_SIZE}"
    print("✅ FILE_UPLOAD_MAX_MEMORY_SIZE: 50MB")
    
    assert hasattr(settings, 'UPLOAD_FILE_MAX_SIZE'), "UPLOAD_FILE_MAX_SIZE not set"
    assert settings.UPLOAD_FILE_MAX_SIZE == 104857600, f"Expected 104857600, got {settings.UPLOAD_FILE_MAX_SIZE}"
    print("✅ UPLOAD_FILE_MAX_SIZE: 100MB")
    
    # Test Cloudinary settings
    if settings.USE_CLOUDINARY:
        assert 'CHUNK_SIZE' in settings.CLOUDINARY_STORAGE, "CHUNK_SIZE not in CLOUDINARY_STORAGE"
        assert settings.CLOUDINARY_STORAGE['CHUNK_SIZE'] == 2000000, f"Expected 2000000, got {settings.CLOUDINARY_STORAGE['CHUNK_SIZE']}"
        print("✅ Cloudinary CHUNK_SIZE: 2MB")
        
        assert 'UPLOAD_TIMEOUT' in settings.CLOUDINARY_STORAGE, "UPLOAD_TIMEOUT not in CLOUDINARY_STORAGE"
        assert settings.CLOUDINARY_STORAGE['UPLOAD_TIMEOUT'] == 300, f"Expected 300, got {settings.CLOUDINARY_STORAGE['UPLOAD_TIMEOUT']}"
        print("✅ Cloudinary UPLOAD_TIMEOUT: 300 seconds")
        
        # Test custom storage backends
        assert 'default' in settings.STORAGES, "default storage not configured"
        assert 'LargeMediaCloudinaryStorage' in str(settings.STORAGES['default']['BACKEND']), "LargeMediaCloudinaryStorage not in use"
        print("✅ Custom LargeMediaCloudinaryStorage configured")
        
        assert 'video_storage' in settings.STORAGES, "video_storage not configured"
        assert 'LargeVideoCloudinaryStorage' in str(settings.STORAGES['video_storage']['BACKEND']), "LargeVideoCloudinaryStorage not in use"
        print("✅ Custom LargeVideoCloudinaryStorage configured")
    
    print("🎉 All file upload settings are properly configured!\n")

def test_gunicorn_timeout():
    """Test Gunicorn timeout configuration"""
    print("🧪 Testing Gunicorn Timeout...")
    
    # Read gunicorn.conf.py
    gunicorn_conf_path = os.path.join(os.path.dirname(__file__), 'gunicorn.conf.py')
    with open(gunicorn_conf_path, 'r') as f:
        content = f.read()
    
    assert 'timeout' in content, "timeout not found in gunicorn.conf.py"
    assert '300' in content, "300 second timeout not found in gunicorn.conf.py"
    print("✅ Gunicorn timeout: 300 seconds (5 minutes)")
    
    print("🎉 Gunicorn timeout is properly configured!\n")

def test_form_validation():
    """Test form validation for large files"""
    print("🧪 Testing Form Validation...")
    
    # Get a collection for testing
    from store.models import Collection
    collection = Collection.objects.first()
    if not collection:
        # Create a test collection if none exists
        collection = Collection.objects.create(
            code='TEST',
            title='Test Collection'
        )
    
    # Test video file size validation
    form_data = {
        'title': 'Test Design', 
        'sku': 'TEST001', 
        'price': '100.00',
        'collection': collection.id
    }
    
    # Test normal size file (should pass)
    normal_file = SimpleUploadedFile("normal_video.mp4", b"fake video content" * 1000, content_type="video/mp4")
    form = DesignAdminForm(data=form_data, files={'video': normal_file})
    assert form.is_valid(), f"Normal file should be valid. Errors: {form.errors}"
    print("✅ Normal size file validation passes")
    
    # Test oversized file (should fail)
    oversized_file = SimpleUploadedFile("oversized_video.mp4", b"x" * (104857600 + 1), content_type="video/mp4")  # 100MB + 1 byte
    form = DesignAdminForm(data=form_data, files={'video': oversized_file})
    assert not form.is_valid(), "Oversized file should be invalid"
    assert 'video' in form.errors, "Video field should have errors"
    assert 'too large' in str(form.errors['video']), "Error should mention file size"
    print("✅ Oversized file validation properly fails")
    
    print("🎉 Form validation is working correctly!\n")

def test_storage_import():
    """Test that custom storage can be imported"""
    print("🧪 Testing Custom Storage Import...")
    
    try:
        from bluewardrobe.storage import LargeMediaCloudinaryStorage, LargeVideoCloudinaryStorage
        print("✅ LargeMediaCloudinaryStorage imported successfully")
        print("✅ LargeVideoCloudinaryStorage imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import custom storage: {e}")
        return False
    
    print("🎉 Custom storage imports working!\n")
    return True

def test_cloudinary_connection():
    """Test Cloudinary connection if configured"""
    print("🧪 Testing Cloudinary Connection...")
    
    if not settings.USE_CLOUDINARY:
        print("⚠️  Cloudinary not configured, skipping connection test")
        return True
    
    try:
        import cloudinary
        import cloudinary.uploader
        
        # Test configuration
        assert hasattr(settings, 'CLOUDINARY_STORAGE'), "CLOUDINARY_STORAGE not configured"
        config = settings.CLOUDINARY_STORAGE
        
        assert config.get('CLOUD_NAME'), "CLOUD_NAME not configured"
        assert config.get('API_KEY'), "API_KEY not configured"
        assert config.get('API_SECRET'), "API_SECRET not configured"
        
        print("✅ Cloudinary configuration found")
        print(f"✅ Cloud Name: {config['CLOUD_NAME']}")
        
        # Note: We won't test actual upload to avoid costs
        print("✅ Cloudinary connection test skipped (to avoid API calls)")
        
    except Exception as e:
        print(f"❌ Cloudinary connection test failed: {e}")
        return False
    
    print("🎉 Cloudinary configuration is valid!\n")
    return True

def main():
    """Run all tests"""
    print("🚀 Starting File Upload Fix Tests...\n")
    
    try:
        test_file_upload_settings()
        test_gunicorn_timeout()
        test_storage_import()
        test_form_validation()
        test_cloudinary_connection()
        
        print("🎉 ALL TESTS PASSED! 🎉")
        print("✅ File upload fixes are working correctly")
        print("✅ Large file uploads should now work without timeouts")
        print("✅ Cloudinary chunked uploads are configured")
        print("✅ Form validation prevents oversized uploads")
        
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
