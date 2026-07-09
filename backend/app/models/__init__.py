# File 12: jobradar/backend/app/models/__init__.py
"""
Models Package
Exports all SQLAlchemy models for easy import
"""

from app.models.user import User, Base

__all__ = [
    "User",
    "Base",
]
