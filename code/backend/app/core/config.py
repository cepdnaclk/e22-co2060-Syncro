# syncro-backend/app/core/config.py
import os
from dotenv import load_dotenv

load_dotenv() # This loads variables from your .env file

class Settings:
    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_development_secret")
    ALGORITHM: str = "HS256"
    
    # Cloudinary Settings
    CLOUDINARY_NAME: str = os.getenv("CLOUDINARY_NAME")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET")

settings = Settings()