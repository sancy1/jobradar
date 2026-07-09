# jobradar\backend\app\utils\jwt.py

"""
JWT Token Utilities
Handles creation, validation, and decoding of JWT tokens
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt

from app.config import settings


def create_jwt(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token with user data safely handling UUID types
    """
    to_encode = data.copy()
    
    # CRITICAL FIX: Ensure 'sub' claim is stringified if a UUID object was passed
    if "sub" in to_encode and not isinstance(to_encode["sub"], str):
        to_encode["sub"] = str(to_encode["sub"])
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def decode_jwt(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode, verify signature, and validate expiration of a JWT token
    """
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Ensure subject claim is present in the token structure
        if "sub" not in payload:
            return None
            
        return payload
    except JWTError:
        return None


def get_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract user ID string from JWT token
    """
    payload = decode_jwt(token)
    if payload:
        return payload.get("sub")
    return None
