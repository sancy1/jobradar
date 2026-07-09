# jobradar/backend/app/middleware/auth.py

"""
Authentication Middleware
Handles JWT validation, user verification, and protected route dependencies
"""

from typing import Optional
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.jwt import decode_jwt
from app.services.user import user_service
from app.models.user import User
from app.services.database import get_db_session

# CRITICAL FIX: Base authorization engine automatically terminates requests on empty tokens.
# We keep this strict for mandatory endpoints.
security = HTTPBearer()

# CRITICAL FIX: We create a decoupled instance with auto_error=False specifically for optional routes.
optional_security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    """
    Validate JWT token and return current authenticated user.
    """
    token = credentials.credentials
    
    # Step 1: Decode and validate JWT
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Step 2: Extract user ID from token
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing user identifier",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Step 3: Fetch user from database
    user = await user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Step 4: Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (wrapper for consistency).
    """
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get current admin user.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: AsyncSession = Depends(get_db_session)
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise return None gracefully.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = decode_jwt(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    # CRITICAL FIX: Forwarded 'db' token context along to the repository lookup
    user = await user_service.get_user_by_id(db, user_id)
    if not user or not user.is_active:
        return None
    
    return user


# ============================================================
# DEPENDENCY HELPERS (for easy import)
# ============================================================
RequireAuth = get_current_active_user
RequireAdmin = get_current_admin_user
OptionalAuth = get_current_user_optional
