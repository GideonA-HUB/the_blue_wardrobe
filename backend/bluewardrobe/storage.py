"""
Custom Cloudinary storage backend to handle large file uploads.

Cloudinary chunked uploads (upload_large) require every part except the final
EOF chunk to be larger than 5MB. Using smaller chunks causes:
  BadRequest: All parts except EOF-chunk must be larger than 5mb

After a failed upload_large call, the underlying file object may be exhausted
or closed; always rewind before any fallback upload.
"""
import logging

import cloudinary
import cloudinary.uploader
from cloudinary_storage.storage import MediaCloudinaryStorage

logger = logging.getLogger(__name__)

# Cloudinary requires non-terminal chunks >= 5 MiB; use 6 MiB for headroom.
CLOUDINARY_CHUNK_SIZE = 6 * 1024 * 1024
# Use chunked API only when a regular upload would be unwieldy (same as before).
LARGE_FILE_THRESHOLD = 10 * 1024 * 1024


class LargeMediaCloudinaryStorage(MediaCloudinaryStorage):
    """
    Custom Cloudinary storage that supports larger file uploads.
    """

    def _save(self, name, content):
        logger.debug("LargeMediaCloudinaryStorage._save name=%s", name)

        lower = name.lower()
        if lower.endswith((".mp4", ".webm", ".mov", ".avi", ".mkv")):
            resource_type = "video"
        elif lower.endswith((".jpg", ".jpeg", ".png", ".gif", ".webp")):
            resource_type = "image"
        else:
            resource_type = "auto"

        folder = None
        if "/" in name:
            folder = name.rsplit("/", 1)[0]

        size = getattr(content, "size", None)
        try:
            if hasattr(content, "seek"):
                content.seek(0)
        except (OSError, ValueError):
            pass

        options_base = {
            "resource_type": resource_type,
            "use_filename": True,
            "unique_filename": False,
            "overwrite": True,
        }
        if folder and not name.startswith(folder + "/"):
            options_base["folder"] = folder

        try:
            if size is not None and size > LARGE_FILE_THRESHOLD:
                options = {
                    **options_base,
                    "chunk_size": CLOUDINARY_CHUNK_SIZE,
                    "timeout": 300,
                }
                result = cloudinary.uploader.upload_large(
                    content,
                    public_id=name,
                    **options,
                )
                return result["public_id"]

            options = dict(options_base)
            result = cloudinary.uploader.upload(
                content,
                public_id=name,
                **options,
            )
            return result["public_id"]

        except Exception as e:
            logger.exception("Cloudinary upload failed for %s: %s", name, e)
            try:
                if hasattr(content, "seek"):
                    content.seek(0)
            except (OSError, ValueError) as seek_err:
                logger.error("Cannot rewind file for fallback upload: %s", seek_err)
                raise

            # Parent uses standard upload; requires a readable file at position 0.
            return super()._save(name, content)

    def url(self, name):
        if not name:
            return ""

        try:
            url = super().url(name)
            if url:
                return url

            lower = name.lower()
            resource_type = (
                "video"
                if lower.endswith((".mp4", ".webm", ".mov", ".avi", ".mkv"))
                else "auto"
            )
            manual_url = cloudinary.utils.cloudinary_url(
                name,
                resource_type=resource_type,
                format="mp4" if resource_type == "video" else None,
            )[0]
            return manual_url or ""
        except Exception as e:
            logger.warning("Error generating URL for %s: %s", name, e)
            return ""


class LargeVideoCloudinaryStorage(LargeMediaCloudinaryStorage):
    """
    Cloudinary storage for video files (large uploads with valid chunk size).
    """

    def _save(self, name, content):
        logger.debug("LargeVideoCloudinaryStorage._save name=%s", name)

        folder = None
        if "/" in name:
            folder = name.rsplit("/", 1)[0]

        options = {
            "resource_type": "video",
            "chunk_size": CLOUDINARY_CHUNK_SIZE,
            "timeout": 600,
            "use_filename": True,
            "unique_filename": False,
            "overwrite": True,
        }
        if folder and not name.startswith(folder + "/"):
            options["folder"] = folder

        try:
            if hasattr(content, "seek"):
                content.seek(0)
        except (OSError, ValueError):
            pass

        try:
            result = cloudinary.uploader.upload_large(
                content,
                public_id=name,
                **options,
            )
            return result["public_id"]
        except Exception as e:
            logger.exception("Cloudinary video upload_large failed for %s: %s", name, e)
            try:
                if hasattr(content, "seek"):
                    content.seek(0)
            except (OSError, ValueError) as seek_err:
                logger.error("Cannot rewind video file after failed chunked upload: %s", seek_err)
                raise

            fallback_opts = {
                "resource_type": "video",
                "use_filename": True,
                "unique_filename": False,
                "overwrite": True,
            }
            if folder and not name.startswith(folder + "/"):
                fallback_opts["folder"] = folder
            result = cloudinary.uploader.upload(content, public_id=name, **fallback_opts)
            return result["public_id"]

    def url(self, name):
        if not name:
            return ""

        try:
            return cloudinary.utils.cloudinary_url(
                name,
                resource_type="video",
                format="mp4",
                quality="auto",
                fetch_format="auto",
            )[0]
        except Exception as e:
            logger.warning("Error generating video URL for %s: %s", name, e)
            return super().url(name)
