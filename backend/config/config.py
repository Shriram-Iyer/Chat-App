# Load environment variables
import os

from dotenv import load_dotenv

load_dotenv()

FLASK_APP = os.getenv('FLASK_APP', 'py')
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
SECRET_KEY = os.getenv('SECRET_KEY', 'your_default_secret_key')
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(',')
CORS_METHODS = ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"]
CORS_SUPPORTS_CREDENTIALS = os.getenv("CORS_SUPPORTS_CREDENTIALS", True).lower() in ("true", "1", "t", "yes")
HOST = '0.0.0.0'
PORT = 8080
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/chatapp')
STREAM_API_KEY = os.getenv('STREAM_API_KEY', 'your_default_steam_api_key')
STREAM_API_SECRET = os.getenv('STREAM_API_SECRET', 'your_default_steam_api_secret')
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', 'your_default_cloud_name')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', 'your_default_cloudinary_api_key')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', 'your_default_cloudinary_api_secret')
