import datetime
import jwt
import hashlib
import hmac
from typing import Optional, Dict, Any
from app.core.config import settings

def hash_password(password: str) -> str:
    """Hashes password securely using HMAC SHA-256 with JWT secret."""
    key = settings.JWT_SECRET.encode('utf-8')
    msg = password.encode('utf-8')
    return hmac.new(key, msg, hashlib.sha256).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the hashed password."""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Generates JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
