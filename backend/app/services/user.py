# jobradar/backend/app/services/user.py

"""
User Service
Handles user database operations: create, read, update, link social accounts
"""

import uuid
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.models.user import User

logger = logging.getLogger(__name__)


class UserService:
    """Handles all user-related database operations"""
    
    async def get_user_by_id(self, db: AsyncSession, user_id: str) -> Optional[User]:
        """Get user by UUID string safely casting type"""
        try:
            uuid_obj = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
            stmt = select(User).where(User.id == uuid_obj)
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except ValueError:
            logger.warning(f"⚠️ Attempted lookup with malformed UUID string: {user_id}")
            return None
    
    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email address safely handling casing"""
        stmt = select(User).where(User.email.ilike(email.strip()))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_user_by_provider(
        self, 
        db: AsyncSession, 
        provider: str, 
        provider_id: str
    ) -> Optional[User]:
        """Get user by social provider and provider ID"""
        stmt = select(User).where(
            and_(
                User.provider == provider,
                User.provider_id == str(provider_id)
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    
    async def create_user(
        self, 
        db: AsyncSession, 
        user_data: Dict[str, Any]
    ) -> User:
        """
        Create a new user from social provider data
        """
        user = User(
            email=user_data.get("email"),
            name=user_data.get("name", "User"),
            profile_picture=user_data.get("profile_picture"),
            provider=user_data.get("provider"),
            provider_id=user_data.get("provider_id"),
            last_login=datetime.now(timezone.utc)
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    
    async def update_user(
        self, 
        db: AsyncSession, 
        user: User, 
        update_data: Dict[str, Any]
    ) -> User:
        """
        Update user profile information
        """
        for key, value in update_data.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)
        
        await db.commit()
        await db.refresh(user)
        return user
    
    async def update_last_login(self, db: AsyncSession, user: User) -> User:
        """
        Update user's last_login timestamp
        """
        user.last_login = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)
        return user
    
    async def get_or_create_user(
        self, 
        db: AsyncSession, 
        provider: str, 
        provider_data: Dict[str, Any]
    ) -> User:
        """
        Get existing user or create new one from social provider data safely with concurrency recovery.
        """
        provider_id = str(provider_data.get("id"))
        email = provider_data.get("email")
        
        # Step 1: Try to find by provider + provider_id
        user = await self.get_user_by_provider(db, provider, provider_id)
        if user:
            await self.update_last_login(db, user)
            return user
        
        # Step 2: Try to find by email (account linking)
        if email:
            user = await self.get_user_by_email(db, email)
            if user:
                # Link the social account to existing user
                user.provider = provider
                user.provider_id = provider_id
                user.name = provider_data.get("name", user.name)
                user.profile_picture = provider_data.get("picture") or provider_data.get("avatar_url") or user.profile_picture
                user.last_login = datetime.now(timezone.utc)
                await db.commit()
                await db.refresh(user)
                return user
        
        # Step 3: Parse standard layout fields
        new_user_data = {
            "email": email,
            "name": provider_data.get("name") or provider_data.get("login", "User"),
            "profile_picture": provider_data.get("picture") or provider_data.get("avatar_url"),
            "provider": provider,
            "provider_id": provider_id
        }
        
        # Step 4: Handle concurrent sign-ups safely
        try:
            return await self.create_user(db, new_user_data)
        except IntegrityError:
            # CRITICAL FIX: Rollback transaction block conflict and read database again
            await db.rollback()
            user = await self.get_user_by_provider(db, provider, provider_id)
            if user:
                await self.update_last_login(db, user)
                return user
            raise
    
    async def deactivate_user(self, db: AsyncSession, user: User) -> User:
        user.is_active = False
        await db.commit()
        await db.refresh(user)
        return user
    
    async def activate_user(self, db: AsyncSession, user: User) -> User:
        user.is_active = True
        await db.commit()
        await db.refresh(user)
        return user


# ============================================================
# SINGLETON INSTANCE
# ============================================================
user_service = UserService()
