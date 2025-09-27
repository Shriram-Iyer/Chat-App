from cloudinary import config as cloudinary_config
import cloudinary
import cloudinary.uploader as _cloudinary_uploader

from config.config import CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME

# Initialize global Cloudinary config (returns None)
cloudinary_config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)

# Expose both the configured cloudinary module and the uploader helper
cloudinary_instance = cloudinary
cloudinary_uploader = _cloudinary_uploader