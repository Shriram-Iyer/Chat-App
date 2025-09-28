from config.cloudinary import cloudinary_instance, cloudinary_uploader
from config.config import FLASK_ENV, SECRET_KEY, MONGO_URI, STREAM_API_KEY, STREAM_API_SECRET, FLASK_APP, HOST, \
    PORT, CORS_ORIGINS, CORS_SUPPORTS_CREDENTIALS, CORS_METHODS, \
    CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME
from config.db import init_mongoengine