# jobradar/backend/app/api/v1/__init__.py:

"""
API v1 Routes Initialization
Registers all v1 route modules with explicit prefixes to prevent routing errors
"""

from fastapi import APIRouter

# CRITICAL FIX: Explicitly import routers from submodules to prevent namespace collision or initialization circular errors
from app.api.v1.auth import router as auth_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.scrape import router as scrape_router
from app.api.v1.search import router as search_router

# Create main v1 router
router = APIRouter()

# Register all route modules cleanly under the centralized v1 path
router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
router.include_router(scrape_router, prefix="/scrape", tags=["Scraping"])
router.include_router(search_router, prefix="/search", tags=["Search"])


# ============================================================
# EXPORTED ROUTERS (for individual imports)
# ============================================================
__all__ = [
    "router"
]