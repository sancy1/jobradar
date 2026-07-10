"""
JobRadar FastAPI Application
Main entry point for the backend server with global error handling and request tracing
"""

# ============================================================
# CRITICAL FIX: Patch logging.config.fileConfig BEFORE any imports
# ============================================================
import sys
import logging
import logging.config

# Monkey-patch fileConfig to ignore /dev/null
_original_fileConfig = logging.config.fileConfig

def _patched_fileConfig(fname, *args, **kwargs):
    if fname == '/dev/null' or (isinstance(fname, str) and fname.endswith('/dev/null')):
        # Ignore the /dev/null config and use basicConfig instead
        logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
        return
    return _original_fileConfig(fname, *args, **kwargs)

logging.config.fileConfig = _patched_fileConfig

# Also patch dictConfig just in case
_original_dictConfig = logging.config.dictConfig

def _patched_dictConfig(config, *args, **kwargs):
    if isinstance(config, dict) and config.get('version') == 1:
        # Just use basicConfig if they try to use dictConfig with version 1
        logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
        return
    return _original_dictConfig(config, *args, **kwargs)

logging.config.dictConfig = _patched_dictConfig

# Now proceed with normal imports
import traceback
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from loguru import logger

from app.config import settings
from app.api.v1 import router as v1_router
from app.utils.logger import setup_logging
from app.services.database import startup_db, shutdown_db
from app.services.redis_client import startup_redis, shutdown_redis

# Setup logging configuration layout before initializing any frameworks
setup_logging()


# ============================================================
# LIFESPAN MANAGER
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan manager for startup and shutdown events
    
    - Startup: Initialize database and secure Redis connections
    - Shutdown: Clean up connections gracefully
    """
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"🔧 Debug mode: {settings.DEBUG}")
    
    # Initialize Database Connection Engine
    await startup_db()
    logger.info("✅ Database connection pool established")
    
    # Initialize Certificate-bound Aiven Redis Client
    redis_client = await startup_redis()
    if redis_client and redis_client._is_connected:
        logger.info("✅ Redis secure connection established")
    else:
        logger.warning("⚠️ Redis is not available - rate limiting and caching features will be disabled")
    
    logger.info("✅ All core services initialized successfully")
    
    yield
    
    logger.info("👋 Shutting down application context channels...")
    
    # Close Redis Connections safely
    await shutdown_redis()
    logger.info("✅ Redis connections terminated")
    
    # Close Database Connection Pools gracefully
    await shutdown_db()
    logger.info("✅ Database connection channels closed")
    
    logger.info(f"👋 {settings.APP_NAME} background shutdown cycle complete")


# ============================================================
# CREATE FASTAPI APPLICATION WITH SECURITY PROFILES
# ============================================================
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="JobRadar - Intelligent Job Discovery & Aggregation Platform",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)


# ============================================================
# CORS MIDDLEWARE (Optimized Production Configuration)
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)


# ============================================================
# UNIFIED REQUEST TRACING & DEBUGGING MIDDLEWARE
# ============================================================
@app.middleware("http")
async def debug_logging_middleware(request: Request, call_next):
    """
    Interceptors monitoring routing pathways. 
    Prints real-time endpoints and captures technical stack traces when exceptions break handlers.
    """
    logger.info(f"➡️ Incoming Request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"⬅️ Response Status: {response.status_code} for {request.url.path}")
        return response
    except Exception as exc:
        logger.exception(f"❌ CRASH OCCURRED during route execution: {request.method} {request.url.path}")
        
        detail = traceback.format_exc() if settings.DEBUG else "An internal processing error occurred on the remote cluster"
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": detail}
        )


# ============================================================
# REGISTER UNIFIED ROUTER PATH
# ============================================================
app.include_router(v1_router, prefix=settings.API_V1_PREFIX)


# ============================================================
# ROOT & BASIC HEALTH CHECK ENDPOINTS
# ============================================================
@app.get(
    "/",
    tags=["Health"],
    summary="Root metadata endpoint",
    description="Returns basic running application info parameters"
)
async def root():
    """Root endpoint - status return"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy"
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Application operational health check",
    description="Returns live platform parameters used by balancing engines and monitors"
)
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ============================================================
# EXCEPTION HANDLERS
# ============================================================
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom validation error handler parsing complex Pydantic structures for simple UI binding
    """
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    logger.warning(f"⚠️ Validation failure on {request.url.path}: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error detected on incoming payload parameters",
            "errors": errors
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler safeguarding internal trace properties against data breaches
    """
    logger.exception(f"❌ Global runtime intercept caught unhandled exception: {exc}")
    
    if settings.DEBUG:
        detail = traceback.format_exc()
    else:
        detail = "An internal processing error occurred on the remote cluster"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": detail
        }
    )


# ============================================================
# PLATFORM ENVIRONMENT EXECUTOR ENTRY POINT
# ============================================================
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        reload_excludes=["*.log", "logs/*"],
        log_config=None,
        log_level="info"
    )