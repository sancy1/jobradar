# # jobradar/backend/app/config.py

# """
# JobRadar Backend Configuration
# Native Social Auth with Pydantic V2 Settings
# """

# from typing import Optional, List
# from pydantic_settings import BaseSettings
# from pydantic import Field


# class Settings(BaseSettings):
#     """JobRadar Backend Configuration - Native Social Auth"""
    
#     # ============================================================
#     # APPLICATION
#     # ============================================================
#     APP_NAME: str = "JobRadar API"
#     APP_VERSION: str = "1.0.0"
#     DEBUG: bool = False
#     SECRET_KEY: str = "change-this-in-production"
    
#     # ============================================================
#     # JWT SETTINGS (For Social Auth)
#     # ============================================================
#     JWT_SECRET: str = "your-jwt-secret-here"
#     JWT_ALGORITHM: str = "HS256"
#     JWT_EXPIRY_MINUTES: int = 60
    
#     # ============================================================
#     # FRONTEND
#     # ============================================================
#     FRONTEND_URL: str = "http://localhost:3000"
    
#     # ============================================================
#     # SOCIAL AUTH - Google OAuth
#     # ============================================================
#     GOOGLE_CLIENT_ID: Optional[str] = None
#     GOOGLE_CLIENT_SECRET: Optional[str] = None
#     GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"
    
#     # ============================================================
#     # SOCIAL AUTH - GitHub OAuth
#     # ============================================================
#     GITHUB_CLIENT_ID: Optional[str] = None
#     GITHUB_CLIENT_SECRET: Optional[str] = None
#     GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/github/callback"
    
#     # ============================================================
#     # DATABASE
#     # ============================================================
#     DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/jobradar"
    
#     # ============================================================
#     # AIVEN REDIS CONFIGURATION (Matches redis_client.py)
#     # ============================================================
#     # These values are loaded from .env if present, otherwise use defaults
#     REDIS_HOST: str = "jobradar-redis-jobradar-redis.c.aivencloud.com"
#     REDIS_PORT: int = 25164
#     REDIS_USERNAME: str = "default"
#     REDIS_PASSWORD: Optional[str] = None
#     REDIS_SSL: bool = True
#     REDIS_SSL_CA_CERT: str = "certs/ca.pem"
#     REDIS_SSL_CERT: str = "certs/service.cert"
#     REDIS_SSL_KEY: str = "certs/service.key"
    
#     # Redis database numbers (for Celery etc.)
#     REDIS_DB_SESSION: int = 0
#     REDIS_DB_CELERY_BROKER: int = 1
#     REDIS_DB_CELERY_BACKEND: int = 2
#     REDIS_DB_CACHE: int = 3
#     REDIS_DB_RATE_LIMIT: int = 4
    
#     # ============================================================
#     # API
#     # ============================================================
#     API_V1_PREFIX: str = "/api/v1"
#     ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
#     # ============================================================
#     # SEARCH ENGINES (Optional - Future)
#     # ============================================================
#     GOOGLE_CSE_KEY: Optional[str] = None
#     GOOGLE_CX_ID: Optional[str] = None
#     SERPAPI_KEY: Optional[str] = None
#     SEARCHAPI_KEY: Optional[str] = None
    
#     # ============================================================
#     # PYDANTIC V2 CONFIGURATION
#     # ============================================================
#     model_config = {
#         "env_file": ".env",
#         "env_file_encoding": "utf-8",
#         "case_sensitive": True,
#         "extra": "ignore"
#     }


# # Singleton instance
# settings = Settings()






























# jobradar/backend/app/config.py

"""
JobRadar Backend Configuration
Native Social Auth with Pydantic V2 Settings
"""

from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """JobRadar Backend Configuration - Native Social Auth"""
    
    # ============================================================
    # APPLICATION
    # ============================================================
    APP_NAME: str = "JobRadar API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "change-this-in-production"
    
    # ============================================================
    # JWT SETTINGS (For Social Auth)
    # ============================================================
    JWT_SECRET: str = "your-jwt-secret-here"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60
    
    # ============================================================
    # FRONTEND
    # ============================================================
    FRONTEND_URL: str = "http://localhost:3000"
    
    # ============================================================
    # SOCIAL AUTH - Google OAuth
    # ============================================================
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"
    
    # ============================================================
    # SOCIAL AUTH - GitHub OAuth
    # ============================================================
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/github/callback"
    
    # ============================================================
    # DATABASE
    # ============================================================
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/jobradar"
    
    # ============================================================
    # CLOUD OBSERVABILITY (BetterStack Logtail)
    # ============================================================
    LOGTAIL_SOURCE_TOKEN: Optional[str] = None
    
    # ============================================================
    # AIVEN REDIS CONFIGURATION (Matches redis_client.py)
    # ============================================================
    # These values are loaded from .env if present, otherwise use defaults
    REDIS_HOST: str = "jobradar-redis-jobradar-redis.c.aivencloud.com"
    REDIS_PORT: int = 25164
    REDIS_USERNAME: str = "default"
    REDIS_PASSWORD: Optional[str] = None
    REDIS_SSL: bool = True
    REDIS_SSL_CA_CERT: str = "certs/ca.pem"
    REDIS_SSL_CERT: str = "certs/service.cert"
    REDIS_SSL_KEY: str = "certs/service.key"
    
    # Redis database numbers (for Celery etc.)
    REDIS_DB_SESSION: int = 0
    REDIS_DB_CELERY_BROKER: int = 1
    REDIS_DB_CELERY_BACKEND: int = 2
    REDIS_DB_CACHE: int = 3
    REDIS_DB_RATE_LIMIT: int = 4
    
    # ============================================================
    # API
    # ============================================================
    API_V1_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # ============================================================
    # SEARCH ENGINES (Optional - Future)
    # ============================================================
    GOOGLE_CSE_KEY: Optional[str] = None
    GOOGLE_CX_ID: Optional[str] = None
    SERPAPI_KEY: Optional[str] = None
    SEARCHAPI_KEY: Optional[str] = None
    
    # ============================================================
    # PYDANTIC V2 CONFIGURATION
    # ============================================================
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }


# Singleton instance
settings = Settings()
