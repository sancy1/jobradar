# # jobradar/backend/app/main.py

# """
# JobRadar FastAPI Application
# Main entry point for the backend server with global error handling and request tracing
# """

# import logging
# import traceback
# from datetime import datetime, timezone
# from contextlib import asynccontextmanager

# from fastapi import FastAPI, Request, status
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from fastapi.exceptions import RequestValidationError

# from app.config import settings
# from app.api.v1 import router as v1_router
# from app.utils.logger import setup_logging
# # CRITICAL FIX: Defined at top-level to eliminate modular lifecycle reference context isolation bugs
# from app.services.database import startup_db, shutdown_db
# from app.services.redis_client import startup_redis, shutdown_redis

# # Setup logging configuration layout
# setup_logging()
# logger = logging.getLogger(__name__)


# # ============================================================
# # LIFESPAN MANAGER
# # ============================================================
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """
#     Lifespan manager for startup and shutdown events
    
#     - Startup: Initialize database and secure Redis connections
#     - Shutdown: Clean up connections gracefully
#     """
#     logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
#     logger.info(f"🔧 Debug mode: {settings.DEBUG}")
    
#     # Initialize Database Connection Engine
#     await startup_db()
#     logger.info("✅ Database connection pool established")
    
#     # Initialize Certificate-bound Aiven Redis Client
#     # Initialize Certificate-bound Aiven Redis Client
#     redis_client = await startup_redis()
#     if redis_client and redis_client._is_connected:
#         logger.info("✅ Redis secure connection established")
#     else:
#         logger.warning("⚠️ Redis is not available - rate limiting and caching features will be disabled")
    
#     logger.info("✅ All core services initialized successfully")
    
#     yield
    
#     logger.info("👋 Shutting down application context channels...")
    
#     # Close Redis Connections safely
#     await shutdown_redis()
#     logger.info("✅ Redis connections terminated")
    
#     # Close Database Connection Pools gracefully
#     await shutdown_db()
#     logger.info("✅ Database connection channels closed")
    
#     logger.info(f"👋 {settings.APP_NAME} background shutdown cycle complete")


# # ============================================================
# # CREATE FASTAPI APPLICATION WITH SECURITY PROFILES
# # ============================================================
# app = FastAPI(
#     title=settings.APP_NAME,
#     version=settings.APP_VERSION,
#     description="JobRadar - Intelligent Job Discovery & Aggregation Platform",
#     lifespan=lifespan,
#     # Hides technical API specifications dynamically outside environment development phases
#     docs_url="/docs" if settings.DEBUG else None,
#     redoc_url="/redoc" if settings.DEBUG else None,
#     openapi_url="/openapi.json" if settings.DEBUG else None,
# )


# # ============================================================
# # CORS MIDDLEWARE (Optimized Production Configuration)
# # ============================================================
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.ALLOWED_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
#     expose_headers=["*"],
#     max_age=600,  # Highly optimized: 10 minutes browser preflight cache
# )


# # ============================================================
# # UNIFIED REQUEST TRACING & DEBUGGING MIDDLEWARE
# # ============================================================
# @app.middleware("http")
# async def debug_logging_middleware(request: Request, call_next):
#     """
#     Interceptors monitoring routing pathways. 
#     Prints real-time endpoints and captures technical stack traces when exceptions break handlers.
#     """
#     logger.info(f"➡️ Incoming Request: {request.method} {request.url.path}")
#     try:
#         response = await call_next(request)
#         logger.info(f"⬅️ Response Status: {response.status_code} for {request.url.path}")
#         return response
#     except Exception as exc:
#         logger.error(f"❌ CRASH OCCURRED during route execution: {request.method} {request.url.path}")
#         logger.error(traceback.format_exc())
        
#         # Safe structural fallback return if exception escapes standard global handlers
#         detail = traceback.format_exc() if settings.DEBUG else "An internal processing error occurred on the remote cluster"
#         return JSONResponse(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             content={"detail": detail}
#         )


# # ============================================================
# # REGISTER UNIFIED ROUTER PATH
# # ============================================================
# app.include_router(v1_router, prefix=settings.API_V1_PREFIX)


# # ============================================================
# # ROOT & BASIC HEALTH CHECK ENDPOINTS
# # ============================================================
# @app.get(
#     "/",
#     tags=["Health"],
#     summary="Root metadata endpoint",
#     description="Returns basic running application info parameters"
# )
# async def root():
#     """Root endpoint - status return"""
#     return {
#         "name": settings.APP_NAME,
#         "version": settings.APP_VERSION,
#         "status": "healthy"
#     }


# @app.get(
#     "/health",
#     tags=["Health"],
#     summary="Application operational health check",
#     description="Returns live platform parameters used by balancing engines and monitors"
# )
# async def health_check():
#     """
#     Health check endpoint
#     """
#     return {
#         "status": "healthy",
#         "service": settings.APP_NAME,
#         "version": settings.APP_VERSION,
#         # CRITICAL FIX: Upgraded hardcoded static timestamp text string with live timezone-aware ISO data
#         "timestamp": datetime.now(timezone.utc).isoformat()
#     }


# # ============================================================
# # EXCEPTION HANDLERS
# # ============================================================
# @app.exception_handler(RequestValidationError)
# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     """
#     Custom validation error handler parsing complex Pydantic structures for simple UI binding
#     """
#     errors = []
#     for error in exc.errors():
#         errors.append({
#             "field": ".".join(str(loc) for loc in error["loc"]),
#             "message": error["msg"],
#             "type": error["type"]
#         })
    
#     logger.warning(f"⚠️ Validation failure on {request.url.path}: {errors}")
#     return JSONResponse(
#         status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
#         content={
#             "detail": "Validation error detected on incoming payload parameters",
#             "errors": errors
#         }
#     )


# @app.exception_handler(Exception)
# async def general_exception_handler(request: Request, exc: Exception):
#     """
#     Global exception handler safeguarding internal trace properties against data breaches
#     """
#     logger.error(f"❌ Global runtime intercept caught unhandled exception: {exc}", exc_info=True)
    
#     # Strict environmental switch preventing local technical traces from leaking into production logs
#     if settings.DEBUG:
#         detail = traceback.format_exc()
#     else:
#         detail = "An internal processing error occurred on the remote cluster"
    
#     return JSONResponse(
#         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         content={
#             "detail": detail
#         }
#     )


# # ============================================================
# # PLATFORM ENVIRONMENT EXECUTOR ENTRY POINT
# # ============================================================
# if __name__ == "__main__":
#     import uvicorn
    
#     uvicorn.run(
#         "app.main:app",
#         host="0.0.0.0",
#         port=8000,
#         reload=settings.DEBUG,
#         log_level="info"
#     )































# jobradar/backend/app/main.py

"""
JobRadar FastAPI Application
Main entry point for the backend server with global error handling and request tracing
"""

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
# CRITICAL FIX: Defined at top-level to eliminate modular lifecycle reference context isolation bugs
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
    # Hides technical API specifications dynamically outside environment development phases
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
    max_age=600,  # Highly optimized: 10 minutes browser preflight cache
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
        
        # Safe structural fallback return if exception escapes standard global handlers
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
        # CRITICAL FIX: Upgraded hardcoded static timestamp text string with live timezone-aware ISO data
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
    # FIX: Use logger.exception to automatically extract trace metadata for BetterStack safely
    logger.exception(f"❌ Global runtime intercept caught unhandled exception: {exc}")
    
    # Strict environmental switch preventing local technical traces from leaking into production logs
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
        reload_excludes=["*.log", "logs/*"],  # CRITICAL: Prevents local infinite restart loops
        log_config=None,
        log_level="info"
    )

