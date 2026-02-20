# app/core/security.py
from datetime import datetime, timedelta
from jose import jwt
from .config import settings

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire})
    
    # The 'role' is included in the payload to facilitate 'Dual-Role' logic 
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)