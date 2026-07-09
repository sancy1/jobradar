# File 13: jobradar/backend/app/schemas/__init__.py
"""
Schemas Package
Exports all Pydantic schemas for API validation
"""

# CRITICAL FIX: Ensure TokenResponse is exposed cleanly for external module dependency validation
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserPreferences,
    UserProfileResponse,
    TokenResponse,
)

__all__ = [
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserPreferences",
    "UserProfileResponse",
    "TokenResponse",
]
