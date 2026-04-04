"""
Custom Cloudinary storage backend to handle large file uploads
"""
import cloudinary
import cloudinary.uploader
from cloudinary_storage.storage import MediaCloudinaryStorage
from django.core.files import File


class LargeMediaCloudinaryStorage(MediaCloudinaryStorage):
    """
    Custom Cloudinary storage that supports larger file uploads
    """
    
    def _save(self, name, content):
        """
        Override save method to handle large files with chunked uploads
        """
        if content.size > 10485760:  # If file is larger than 10MB
            # Use chunked upload for large files
            options = {
                'resource_type': 'auto',
                'chunk_size': 2000000,  # 2MB chunks
                'timeout': 300,  # 5 minutes timeout
                'use_filename': True,
                'unique_filename': False,
                'overwrite': True,
            }
            
            # Reset file pointer to beginning
            content.seek(0)
            
            # Upload with chunked upload
            result = cloudinary.uploader.upload_large(
                content,
                public_id=name,
                **options
            )
            
            # Return the public URL
            return result['public_id']
        else:
            # Use normal upload for smaller files
            return super()._save(name, content)


class LargeVideoCloudinaryStorage(LargeMediaCloudinaryStorage):
    """
    Custom Cloudinary storage for video files with large file support
    """
    
    def _save(self, name, content):
        """
        Override save method for video files
        """
        options = {
            'resource_type': 'video',
            'chunk_size': 2000000,  # 2MB chunks
            'timeout': 600,  # 10 minutes timeout for videos
            'use_filename': True,
            'unique_filename': False,
            'overwrite': True,
        }
        
        # Reset file pointer to beginning
        content.seek(0)
        
        # Upload video with chunked upload
        result = cloudinary.uploader.upload_large(
            content,
            public_id=name,
            **options
        )
        
        return result['public_id']
