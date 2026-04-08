"""
Custom Cloudinary storage backend to handle large file uploads
"""
import cloudinary
import cloudinary.uploader
from cloudinary_storage.storage import MediaCloudinaryStorage, RawMediaCloudinaryStorage
from django.core.files import File
from django.conf import settings


class LargeMediaCloudinaryStorage(MediaCloudinaryStorage):
    """
    Custom Cloudinary storage that supports larger file uploads
    """
    
    def _save(self, name, content):
        """
        Override save method to handle large files with chunked uploads
        """
        print(f"DEBUG: LargeMediaCloudinaryStorage._save called for {name}")
        
        # Determine resource type based on file extension
        if name.lower().endswith(('.mp4', '.webm', '.mov', '.avi', '.mkv')):
            resource_type = 'video'
        elif name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            resource_type = 'image'
        else:
            resource_type = 'auto'
        
        try:
            if content.size > 10485760:  # If file is larger than 10MB
                # Use chunked upload for large files
                options = {
                    'resource_type': resource_type,
                    'chunk_size': 2000000,  # 2MB chunks
                    'timeout': 300,  # 5 minutes timeout
                    'use_filename': True,
                    'unique_filename': False,
                    'overwrite': True,
                    'folder': 'designs/videos' if resource_type == 'video' else 'designs/images'
                }
                
                print(f"DEBUG: Using chunked upload for large file, options: {options}")
                
                # Reset file pointer to beginning
                content.seek(0)
                
                # Upload with chunked upload
                result = cloudinary.uploader.upload_large(
                    content,
                    public_id=name,
                    **options
                )
                
                print(f"DEBUG: Chunked upload result: {result}")
                # Return the public ID
                return result['public_id']
            else:
                # Use normal upload for smaller files
                print(f"DEBUG: Using normal upload for small file: {name}")
                
                options = {
                    'resource_type': resource_type,
                    'use_filename': True,
                    'unique_filename': False,
                    'overwrite': True,
                    'folder': 'designs/videos' if resource_type == 'video' else 'designs/images'
                }
                
                # Reset file pointer to beginning
                content.seek(0)
                
                result = cloudinary.uploader.upload(
                    content,
                    public_id=name,
                    **options
                )
                
                print(f"DEBUG: Normal upload result: {result}")
                return result['public_id']
                
        except Exception as e:
            print(f"DEBUG: Error in Cloudinary upload: {e}")
            # Fallback to parent method
            return super()._save(name, content)
    
    def url(self, name):
        """
        Override URL generation to ensure proper Cloudinary URLs
        """
        print(f"DEBUG: LargeMediaCloudinaryStorage.url called for {name}")
        
        if not name:
            return ''
        
        try:
            # Get the URL from Cloudinary
            url = super().url(name)
            print(f"DEBUG: Generated Cloudinary URL: {url}")
            return url
        except Exception as e:
            print(f"DEBUG: Error generating URL for {name}: {e}")
            return ''


class LargeVideoCloudinaryStorage(LargeMediaCloudinaryStorage):
    """
    Custom Cloudinary storage for video files with large file support
    """
    
    def _save(self, name, content):
        """
        Override save method for video files
        """
        print(f"DEBUG: LargeVideoCloudinaryStorage._save called for {name}")
        
        options = {
            'resource_type': 'video',
            'chunk_size': 2000000,  # 2MB chunks
            'timeout': 600,  # 10 minutes timeout for videos
            'use_filename': True,
            'unique_filename': False,
            'overwrite': True,
            'folder': 'designs/videos'
        }
        
        print(f"DEBUG: Video upload options: {options}")
        
        # Reset file pointer to beginning
        content.seek(0)
        
        # Upload video with chunked upload
        result = cloudinary.uploader.upload_large(
            content,
            public_id=name,
            **options
        )
        
        print(f"DEBUG: Video upload result: {result}")
        return result['public_id']
    
    def url(self, name):
        """
        Override URL generation for videos
        """
        print(f"DEBUG: LargeVideoCloudinaryStorage.url called for {name}")
        
        if not name:
            return ''
        
        try:
            # Generate video URL with streaming options
            url = cloudinary.utils.cloudinary_url(
                name,
                resource_type='video',
                format='mp4',
                quality='auto',
                fetch_format='auto'
            )[0]
            
            print(f"DEBUG: Generated video URL: {url}")
            return url
        except Exception as e:
            print(f"DEBUG: Error generating video URL for {name}: {e}")
            # Fallback to parent method
            return super().url(name)
