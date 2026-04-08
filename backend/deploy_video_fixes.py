#!/usr/bin/env python
"""
Comprehensive script to deploy and test video fixes
"""
import os
import sys
import subprocess
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')
django.setup()

def run_command(command, description):
    """Run a command and return the result"""
    print(f"\n{'='*50}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        print(f"STDOUT:\n{result.stdout}")
        if result.stderr:
            print(f"STDERR:\n{result.stderr}")
        print(f"Return code: {result.returncode}")
        return result.returncode == 0
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def check_cloudinary_config():
    """Check Cloudinary configuration"""
    print("\n" + "="*50)
    print("CHECKING CLOUDINARY CONFIGURATION")
    print("="*50)
    
    from django.conf import settings
    
    print(f"USE_CLOUDINARY: {getattr(settings, 'USE_CLOUDINARY', 'NOT SET')}")
    print(f"CLOUDINARY_STORAGE: {getattr(settings, 'CLOUDINARY_STORAGE', 'NOT SET')}")
    print(f"DEFAULT_FILE_STORAGE: {getattr(settings, 'DEFAULT_FILE_STORAGE', 'NOT SET')}")
    print(f"MEDIA_URL: {getattr(settings, 'MEDIA_URL', 'NOT SET')}")
    print(f"MEDIA_ROOT: {getattr(settings, 'MEDIA_ROOT', 'NOT SET')}")
    
    if hasattr(settings, 'STORAGES'):
        print(f"STORAGES: {settings.STORAGES}")
    else:
        print("STORAGES: NOT SET")

def test_cloudinary_connection():
    """Test Cloudinary connection"""
    print("\n" + "="*50)
    print("TESTING CLOUDINARY CONNECTION")
    print("="*50)
    
    try:
        import cloudinary
        import cloudinary.uploader
        from django.conf import settings
        
        # Test Cloudinary configuration
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
            api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
            api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
        )
        
        # Test upload with a small test file
        test_content = b"test video content"
        result = cloudinary.uploader.upload(
            test_content,
            resource_type='video',
            public_id='test_connection',
            folder='designs/videos'
        )
        
        print(f"Cloudinary test upload successful: {result}")
        
        # Clean up test file
        cloudinary.uploader.destroy('designs/videos/test_connection', resource_type='video')
        print("Test file cleaned up successfully")
        
        return True
        
    except Exception as e:
        print(f"Cloudinary connection test failed: {e}")
        return False

def create_migration():
    """Create migration for video field fix"""
    print("\n" + "="*50)
    print("CREATING MIGRATION FOR VIDEO FIELD")
    print("="*50)
    
    return run_command(
        "python manage.py makemigrations store --name fix_video_field_storage",
        "Create migration to fix video field storage"
    )

def apply_migrations():
    """Apply migrations"""
    print("\n" + "="*50)
    print("APPLYING MIGRATIONS")
    print("="*50)
    
    return run_command(
        "python manage.py migrate",
        "Apply database migrations"
    )

def collect_static():
    """Collect static files"""
    print("\n" + "="*50)
    print("COLLECTING STATIC FILES")
    print("="*50)
    
    return run_command(
        "python manage.py collectstatic --noinput",
        "Collect static files"
    )

def main():
    """Main deployment function"""
    print("STARTING COMPREHENSIVE VIDEO FIX DEPLOYMENT")
    print("="*60)
    
    # Check configuration
    check_cloudinary_config()
    
    # Test Cloudinary connection (only if Cloudinary is configured)
    from django.conf import settings
    if getattr(settings, 'USE_CLOUDINARY', False):
        if not test_cloudinary_connection():
            print("WARNING: Cloudinary connection test failed!")
            input("Press Enter to continue anyway...")
    
    # Create and apply migrations
    if not create_migration():
        print("ERROR: Migration creation failed!")
        return False
    
    if not apply_migrations():
        print("ERROR: Migration failed!")
        return False
    
    # Collect static files
    if not collect_static():
        print("ERROR: Static file collection failed!")
        return False
    
    print("\n" + "="*60)
    print("DEPLOYMENT COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("\nNext steps:")
    print("1. Deploy these changes to Railway")
    print("2. Check Railway deployment logs for debug messages")
    print("3. Test video upload in Django admin")
    print("4. Test video playback on website")
    print("\nExpected debug messages in Railway logs:")
    print("- DEBUG: Cloudinary config - CLOUD_NAME: SET")
    print("- DEBUG: USE_CLOUDINARY = True")
    print("- DEBUG: Using Cloudinary storage - DEFAULT_FILE_STORAGE: bluewardrobe.storage.LargeMediaCloudinaryStorage")
    print("- DEBUG: LargeMediaCloudinaryStorage._save called for [filename]")
    print("- DEBUG: Generated Cloudinary URL: [url]")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
