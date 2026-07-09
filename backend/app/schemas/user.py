# jobradar/backend/app/schemas/user.py

"""
Pydantic Schemas for User API
Separated from models for clean architecture
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# ============================================================
# USER PREFERENCES SCHEMA
# ============================================================
class UserPreferences(BaseModel):
    """Structured user settings schema"""
    default_keywords: List[str] = []
    default_location_preference: str = "worldwide"
    default_remote_only: bool = True
    default_entry_level_only: bool = False


# ============================================================
# BASE USER SCHEMA
# ============================================================
class UserBase(BaseModel):
    """Base user fields from social providers"""
    email: EmailStr
    name: str
    profile_picture: Optional[str] = None
    provider: str = Field(..., pattern="^(google|github)$")
    provider_id: str


# ============================================================
# CREATE USER SCHEMA
# ============================================================
class UserCreate(UserBase):
    """Schema for creating a new user"""
    pass


# ============================================================
# UPDATE USER SCHEMA
# ============================================================
class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    name: Optional[str] = None
    profile_picture: Optional[str] = None
    default_keywords: Optional[List[str]] = None
    default_location_preference: Optional[str] = None
    default_remote_only: Optional[bool] = None
    default_entry_level_only: Optional[bool] = None


# ============================================================
# API RESPONSE SCHEMAS
# ============================================================
class UserResponse(UserBase):
    """Full user response for API"""
    id: UUID
    is_active: bool
    is_admin: bool
    created_at: datetime
    last_login: datetime
    preferences: UserPreferences
    
    # Pydantic V2 configuration
    model_config = {
        "from_attributes": True
    }


class UserProfileResponse(BaseModel):
    """User profile response (without provider_id)"""
    id: UUID
    email: EmailStr
    name: str
    profile_picture: Optional[str] = None
    provider: str
    is_admin: bool
    preferences: UserPreferences
    created_at: datetime
    last_login: datetime
    
    # Pydantic V2 configuration
    model_config = {
        "from_attributes": True
    }


# ============================================================
# TOKEN RESPONSE SCHEMA
# ============================================================
class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserProfileResponse