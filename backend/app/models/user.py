
# jobradar/backend/app/models/user.py

"""
User Model - Native Social Authentication
Matches the existing database schema on Neon Cloud
No auto-creation needed - tables already exist
"""

import uuid
from typing import Dict, Any, Optional

from sqlalchemy import Column, String, Boolean, DateTime, ARRAY, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    """User model for social authentication (Google/GitHub)"""
    
    __tablename__ = "users"
    
    # ============================================================
    # PRIMARY IDENTIFIER
    # ============================================================
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )
    
    # ============================================================
    # USER PROFILE (from social providers)
    # ============================================================
    email = Column(
        String(200),
        nullable=False,
        unique=True,
        index=True
    )
    name = Column(
        String(200),
        nullable=False
    )
    profile_picture = Column(
        String(500),
        nullable=True
    )
    
    # ============================================================
    # SOCIAL PROVIDER INFO (REQUIRED)
    # ============================================================
    provider = Column(
        String(50),
        nullable=False
    )
    provider_id = Column(
        String(255),
        nullable=False
    )
    
    # ============================================================
    # USER PREFERENCES
    # ============================================================
    default_keywords = Column(
        ARRAY(String),
        server_default="{}"
    )
    default_location_preference = Column(
        String(50),
        default="worldwide"
    )
    default_remote_only = Column(
        Boolean,
        default=True
    )
    default_entry_level_only = Column(
        Boolean,
        default=False
    )
    
    # ============================================================
    # ACCOUNT STATUS
    # ============================================================
    is_active = Column(
        Boolean,
        default=True
    )
    is_admin = Column(
        Boolean,
        default=False
    )
    
    # ============================================================
    # TIMESTAMPS
    # ============================================================
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    last_login = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    # ============================================================
    # TABLE CONSTRAINTS
    # ============================================================
    __table_args__ = (
        CheckConstraint(
            "provider IN ('google', 'github')",
            name="users_provider_check"
        ),
        UniqueConstraint(
            'provider',
            'provider_id',
            name='unique_provider_id'
        ),
    )
    
    # ============================================================
    # REPRESENTATION
    # ============================================================
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, provider={self.provider})>"
    
    # ============================================================
    # PROPERTY: Structured Preferences for Pydantic
    # ============================================================
    @property
    def preferences(self) -> Dict[str, Any]:
        """Map flat database columns to structured Pydantic schema"""
        return {
            "default_keywords": self.default_keywords or [],
            "default_location_preference": self.default_location_preference,
            "default_remote_only": self.default_remote_only,
            "default_entry_level_only": self.default_entry_level_only,
        }
    
    # ============================================================
    # HELPER METHODS
    # ============================================================
    def update_last_login(self) -> None:
        """Update the last_login timestamp to current time"""
        from datetime import datetime, timezone
        self.last_login = datetime.now(timezone.utc)
    
    def is_google_user(self) -> bool:
        """Check if user signed up with Google"""
        return self.provider == "google"
    
    def is_github_user(self) -> bool:
        """Check if user signed up with GitHub"""
        return self.provider == "github"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert user to dictionary for API responses"""
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "profile_picture": self.profile_picture,
            "provider": self.provider,
            "provider_id": self.provider_id,
            "is_admin": self.is_admin,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "preferences": self.preferences
        }