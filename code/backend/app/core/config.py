# syncro-backend/app/core/config.py
import os
from dotenv import load_dotenv

load_dotenv() # This loads variables from your .env file

class Settings:
    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_development_secret")
    ALGORITHM: str = "HS256"
    
    # ImageKit Settings (v5 SDK only needs private_key for server-side uploads)
    IMAGEKIT_PRIVATE_KEY: str = os.getenv("IMAGEKIT_PRIVATE_KEY")

settings = Settings()