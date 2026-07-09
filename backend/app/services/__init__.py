# File 14: jobradar/backend/app/services/__init__.py
"""
Services Package
Exports all service instances for dependency injection
"""

from app.services.user import user_service, UserService
from app.services.oauth import oauth_service, OAuthService
from app.services.database import (
    get_db,
    get_db_session,
    startup_db,
    shutdown_db,
    db_health,
    db_stats,
    db_close,
    DatabaseManager,
)

__all__ = [
    # User Service
    "user_service",
    "UserService",
    # OAuth Service
    "oauth_service",
    "OAuthService",
    # Database
    "get_db",
    "get_db_session",
    "startup_db",
    "shutdown_db",
    "db_health",
    "db_stats",
    "db_close",
    "DatabaseManager",
]
