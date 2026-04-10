"""
Custom Cloudinary storage backend with resilient file handling.

django-cloudinary-storage builds delivery URLs by prepending PREFIX (default:
MEDIA_URL, i.e. "media/") to the stored public_id. Uploads must use the same
prefixed path or the CDN URL will 404 even though the admin save succeeded.
"""
import io
import logging
import os

import cloudinary
import cloudinary.uploader
from cloudinary_storage.storage import MediaCloudinaryStorage
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import UploadedFile
from PIL import Image, ImageOps

logger = logging.getLogger(__name__)

CLOUDINARY_CHUNK_SIZE = 6 * 1024 * 1024
LARGE_FILE_THRESHOLD = 10 * 1024 * 1024
MAX_CLOUDINARY_IMAGE_BYTES = 10 * 1024 * 1024
TARGET_COMPRESSED_IMAGE_BYTES = int(9.5 * 1024 * 1024)


def _read_all_bytes(content):
    if hasattr(content, "seek"):
        content.seek(0)
    data = content.read()
    return data if isinstance(data, (bytes, bytearray)) else bytes(data)


def _to_content_file(data, name):
    file_obj = ContentFile(data)
    file_obj.name = name
    return file_obj


def _compress_image_for_cloudinary(data):
    """
    Compress oversized images so they can pass Cloudinary 10MB account limits.
    """
    try:
        image = Image.open(io.BytesIO(data))
        image = ImageOps.exif_transpose(image)
    except Exception:
        return data

    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")

    quality_steps = [85, 75, 65, 55, 45, 35]
    working = image
    for quality in quality_steps:
        buf = io.BytesIO()
        working.save(buf, format="JPEG", optimize=True, progressive=True, quality=quality)
        compressed = buf.getvalue()
        if len(compressed) <= TARGET_COMPRESSED_IMAGE_BYTES:
            return compressed

    # If still too large, reduce dimensions progressively.
    for _ in range(3):
        w, h = working.size
        working = working.resize((max(1, int(w * 0.85)), max(1, int(h * 0.85))), Image.LANCZOS)
        buf = io.BytesIO()
        working.save(buf, format="JPEG", optimize=True, progressive=True, quality=45)
        compressed = buf.getvalue()
        if len(compressed) <= TARGET_COMPRESSED_IMAGE_BYTES:
            return compressed

    return compressed if "compressed" in locals() else data


class LargeMediaCloudinaryStorage(MediaCloudinaryStorage):
    """
    Custom Cloudinary storage that supports larger file uploads.
    """

    def _save(self, name, content):
        # Must match url() / _prepend_prefix so stored public_id aligns with delivery URLs.
        name = self._prepend_prefix(self._normalise_name(name))
        logger.debug("LargeMediaCloudinaryStorage._save name=%s", name)

        lower = name.lower()
        if lower.endswith((".mp4", ".webm", ".mov", ".avi", ".mkv")):
            resource_type = "video"
        elif lower.endswith((".jpg", ".jpeg", ".png", ".gif", ".webp")):
            resource_type = "image"
        else:
            resource_type = "auto"

        size = getattr(content, "size", None)

        try:
            upload_content = content

            # Images: Cloudinary account enforces 10MB hard limit for this account.
            # Read into memory so retries do not depend on a possibly closed stream.
            if resource_type == "image":
                data = _read_all_bytes(content)
                if len(data) > MAX_CLOUDINARY_IMAGE_BYTES:
                    data = _compress_image_for_cloudinary(data)
                upload_content = _to_content_file(data, name)
                size = len(data)
                # Same upload semantics as MediaCloudinaryStorage (folder + tags + resource_type).
                uf = UploadedFile(upload_content, name)
                response = MediaCloudinaryStorage._upload(self, name, uf)
                return response["public_id"]

            folder = os.path.dirname(name)
            if size is not None and size > LARGE_FILE_THRESHOLD:
                options = {
                    "resource_type": resource_type,
                    "chunk_size": CLOUDINARY_CHUNK_SIZE,
                    "timeout": 300,
                    "use_filename": True,
                    "unique_filename": False,
                    "overwrite": True,
                    "tags": self.TAG,
                }
                if folder:
                    options["folder"] = folder
                if hasattr(upload_content, "seek"):
                    upload_content.seek(0)
                result = cloudinary.uploader.upload_large(
                    upload_content,
                    public_id=name,
                    **options,
                )
                return result["public_id"]

            options = {
                "resource_type": resource_type,
                "use_filename": True,
                "unique_filename": False,
                "overwrite": True,
                "tags": self.TAG,
            }
            if folder:
                options["folder"] = folder
            if hasattr(upload_content, "seek"):
                upload_content.seek(0)
            result = cloudinary.uploader.upload(
                upload_content,
                public_id=name,
                **options,
            )
            return result["public_id"]

        except Exception as e:
            logger.exception("Cloudinary upload failed for %s: %s", name, e)
            # Fallback should use a fresh buffer when possible.
            try:
                if resource_type == "image":
                    data = _read_all_bytes(content)
                    fallback_file = _to_content_file(data, name)
                    return MediaCloudinaryStorage._save(self, name, fallback_file)

                if hasattr(content, "seek"):
                    content.seek(0)
                return MediaCloudinaryStorage._save(self, name, content)
            except (OSError, ValueError) as seek_err:
                logger.error("Cannot rewind file for fallback upload: %s", seek_err)
                raise

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
        name = self._prepend_prefix(self._normalise_name(name))
        logger.debug("LargeVideoCloudinaryStorage._save name=%s", name)

        folder = os.path.dirname(name)

        options = {
            "resource_type": "video",
            "chunk_size": CLOUDINARY_CHUNK_SIZE,
            "timeout": 600,
            "use_filename": True,
            "unique_filename": False,
            "overwrite": True,
            "tags": self.TAG,
        }
        if folder:
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
                "tags": self.TAG,
            }
            if folder:
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
