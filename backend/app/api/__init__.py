# File 17: jobradar/backend/app/api/__init__.py
"""
API Package
Exports API routers
"""

from app.api.v1 import router as v1_router

__all__ = [
    "v1_router",
]
