"""
Logging Utility
Sets up structured loguru logging, intercepts native logging statements,
and pipes real-time production records securely into BetterStack Logtail.
"""

import sys
import logging
from loguru import logger
from logtail import LogtailHandler

from app.config import settings


def setup_logging() -> None:
    """
    Configure loguru engines for application deployment and cloud synchronization
    """
    # Remove default base logging outputs
    logger.remove()
    
    # 1. Route console sink with tailored coloring (Always active for Docker/Systemd collection)
    logger.add(
        sys.stdout,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "<level>{message}</level>"
        ),
        level="DEBUG" if settings.DEBUG else "INFO",
        colorize=True,
        backtrace=settings.DEBUG,
        diagnose=settings.DEBUG,
    )
    
    # ============================================================
    # LOCAL FILE SINKS (Only active when DEBUG=True)
    # ============================================================
    if settings.DEBUG:
        # Establish local daily error log rotators
        logger.add(
            "logs/error_{time:YYYY-MM-DD}.log",
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
            level="ERROR",
            rotation="1 day",
            retention="30 days",
            compression="zip",
        )
        
        # Establish verbose application tracking during debugging phases
        logger.add(
            "logs/app_{time:YYYY-MM-DD}.log",
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
            level="DEBUG",
            rotation="1 day",
            retention="14 days",
            compression="zip",
        )
    else:
        # Visual anchor printed to container logs ensuring file protection is active
        print("🚀 Production environment detected: Local file writing is disabled.", file=sys.stdout)
        
    # ============================================================
    # CLOUD LOGGING CHANNEL (BetterStack Logtail)
    # ============================================================
    logtail_token = getattr(settings, "LOGTAIL_SOURCE_TOKEN", None)
    if logtail_token:
        try:
            logtail_handler = LogtailHandler(source_token=str(logtail_token))
            
            logger.add(
                logtail_handler,
                format="{message}",
                level="INFO",
                backtrace=False,
                diagnose=False,
            )
        except Exception as exc:
            print(f"⚠️ Failed to instantiate cloud logging channel engine connection: {exc}", file=sys.stderr)
    
    # CRITICAL FIX: Intercept standard Python logging channels to prevent stream duplicates or lost entries
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            try:
                level = logger.level(record.levelname).name
            except ValueError:
                level = record.levelno

            frame, depth = logging.currentframe(), 2
            while frame.f_code.co_filename == logging.__file__:
                frame = frame.f_back
                depth += 1

            logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Reroute explicit module definitions down into the handler hook
    for logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error", "sqlalchemy.engine", "authlib"):
        mod_logger = logging.getLogger(logger_name)
        mod_logger.handlers = [InterceptHandler()]
        mod_logger.propagate = False
        
    logger.info(f"📋 Logging pipeline initialized (DEBUG={settings.DEBUG}, Cloud-Sync={bool(logtail_token)})")