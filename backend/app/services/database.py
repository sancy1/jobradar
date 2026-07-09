"""
Database Connection Manager for JobRadar
Handles connection pooling, health checks, and auto-retry with Neon wake-up ping.
"""

import os
import ssl
import time
import logging
from typing import Optional, Generator, AsyncGenerator
from contextlib import contextmanager, asynccontextmanager
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

import psycopg2
from psycopg2 import pool, sql, OperationalError
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Setup logging
logger = logging.getLogger(__name__)


def normalize_database_url(url: Optional[str]) -> tuple[str, dict]:
    """Return an async SQLAlchemy-compatible database URL and connect args."""
    if not url:
        raise ValueError("DATABASE_URL not set in environment variables")

    parsed = urlparse(url)
    scheme = parsed.scheme
    if scheme == "postgresql":
        scheme = "postgresql+asyncpg"
    elif scheme == "postgres":
        scheme = "postgresql+asyncpg"

    # Filter out asyncpg-unsupported query params and build connect args.
    connect_args = {}
    query_params = parse_qsl(parsed.query, keep_blank_values=True)
    sanitized_params = []

    for key, value in query_params:
        if key == "sslmode":
            if value.lower() in {"require", "verify-ca", "verify-full", "prefer", "allow"}:
                connect_args["ssl"] = ssl.create_default_context()
            elif value.lower() == "disable":
                connect_args["ssl"] = False
            # asyncpg does not accept sslmode directly; do not pass it through.
        elif key == "channel_binding":
            # asyncpg does not support channel_binding query parameter
            continue
        else:
            sanitized_params.append((key, value))

    sanitized_query = urlencode(sanitized_params, doseq=True)
    normalized_url = urlunparse((scheme, parsed.netloc, parsed.path, parsed.params, sanitized_query, parsed.fragment))
    return normalized_url, connect_args


_async_engine = None
_AsyncSessionLocal = None

# ======================================================
# CONFIGURATION
# ======================================================
DATABASE_URL = os.getenv("DATABASE_URL")
MAX_RETRIES = 6
RETRY_DELAY = 3  # seconds between retries
PING_TIMEOUT = 5  # seconds for ping attempt
POOL_MIN_CONNECTIONS = 1
POOL_MAX_CONNECTIONS = 10


# ======================================================
# CONNECTION POOL MANAGER
# ======================================================
class DatabaseManager:
    """Manages database connections with auto-retry and health checks"""
    
    def __init__(self):
        self._pool: Optional[pool.SimpleConnectionPool] = None
        self._is_connected = False
        self._connection_attempts = 0
        self._was_sleeping = False
        
    def _parse_db_url(self) -> dict:
        """Parse DATABASE_URL into connection parameters"""
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL not set in environment variables")
        
        result = urlparse(DATABASE_URL)
        
        return {
            'dbname': result.path.lstrip('/'),
            'user': result.username,
            'password': result.password,
            'host': result.hostname,
            'port': result.port or 5432,
            'sslmode': 'require'  # Required for Neon
        }
    
    def _ping_database(self, conn_params: dict) -> bool:
        """Ping the database to wake it up (especially for Neon serverless)"""
        try:
            logger.info("📡 Sending wake-up ping to Neon database...")
            
            ping_conn = psycopg2.connect(
                **conn_params,
                connect_timeout=PING_TIMEOUT,
                keepalives=1,
                keepalives_idle=1,
                keepalives_interval=1,
                keepalives_count=2
            )
            
            with ping_conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                
            ping_conn.close()
            
            if result:
                logger.info("✅ Database wake-up ping successful")
                return True
            else:
                logger.warning("⚠️ Database ping returned no response")
                return False
                
        except OperationalError as e:
            if "timeout" in str(e).lower():
                logger.warning("⏳ Database ping timeout - database may be sleeping, retrying...")
                return False
            elif "connection refused" in str(e).lower():
                logger.warning("🔌 Connection refused - database may be starting up...")
                return False
            else:
                logger.error(f"❌ Ping failed: {e}")
                return False
        except Exception as e:
            logger.error(f"❌ Unexpected ping error: {e}")
            return False
    
    def connect(self, force_retry: bool = False) -> bool:
        """Establish connection to the database with auto-retry"""
        if self._is_connected and not force_retry and self._pool:
            logger.info("✅ Already connected to database")
            return True
        
        if not DATABASE_URL:
            logger.error("❌ DATABASE_URL not configured in .env file")
            return False
        
        conn_params = self._parse_db_url()
        self._connection_attempts = 0
        
        logger.info(f"🔄 Attempting to connect to Neon database (max {MAX_RETRIES} retries)...")
        
        # Step 1: Ping to wake up database
        logger.info("📡 Pinging database to wake it up...")
        ping_success = self._ping_database(conn_params)
        
        if not ping_success:
            logger.info("⏳ Database may be sleeping. Waiting for wake-up...")
            time.sleep(2)
            
            logger.info("📡 Second wake-up ping...")
            ping_success = self._ping_database(conn_params)
        
        if ping_success:
            logger.info("✅ Database is awake and responding")
            self._was_sleeping = False
        else:
            logger.warning("⚠️ Could not confirm database wake-up, but will attempt connection anyway")
            self._was_sleeping = True
        
        # Step 2: Attempt connection with retries
        while self._connection_attempts < MAX_RETRIES:
            self._connection_attempts += 1
            
            try:
                logger.info(f"🔌 Connection attempt {self._connection_attempts}/{MAX_RETRIES}...")
                
                self._pool = pool.SimpleConnectionPool(
                    POOL_MIN_CONNECTIONS,
                    POOL_MAX_CONNECTIONS,
                    **conn_params,
                    connect_timeout=10,
                    keepalives=1,
                    keepalives_idle=5,
                    keepalives_interval=2,
                    keepalives_count=3
                )
                
                if self._pool:
                    test_conn = self._pool.getconn()
                    with test_conn.cursor() as cursor:
                        cursor.execute("SELECT version()")
                        version = cursor.fetchone()
                        logger.info(f"✅ PostgreSQL version: {version[0][:50]}...")
                    
                    self._pool.putconn(test_conn)
                    self._is_connected = True
                    
                    if self._was_sleeping:
                        logger.info("💤 Database was sleeping but now connected successfully!")
                    else:
                        logger.info("✅ Database connected successfully!")
                    
                    logger.info(f"📊 Connection pool: {POOL_MIN_CONNECTIONS}-{POOL_MAX_CONNECTIONS} connections")
                    logger.info(f"🔄 Connection established after {self._connection_attempts} attempt(s)")
                    
                    return True
                
            except OperationalError as e:
                error_msg = str(e).lower()
                
                if "timeout" in error_msg or "timed out" in error_msg:
                    logger.warning(f"⏳ Connection attempt {self._connection_attempts} timed out")
                elif "connection refused" in error_msg:
                    logger.warning(f"🔌 Connection attempt {self._connection_attempts} refused")
                elif "authentication" in error_msg or "password" in error_msg:
                    logger.error("🔑 Authentication failed - check your DATABASE_URL credentials")
                    return False
                else:
                    logger.warning(f"⚠️ Connection attempt {self._connection_attempts} failed: {e}")
                
                if self._connection_attempts < MAX_RETRIES:
                    wait_time = RETRY_DELAY * (1.5 ** (self._connection_attempts - 1))
                    logger.info(f"⏳ Waiting {wait_time:.1f}s before next retry...")
                    time.sleep(wait_time)
                    
                    if self._connection_attempts >= 3:
                        logger.info("📡 Re-pinging database during long retry...")
                        self._ping_database(conn_params)
                        
            except Exception as e:
                logger.error(f"❌ Unexpected connection error: {e}")
                if self._connection_attempts < MAX_RETRIES:
                    time.sleep(RETRY_DELAY)
                else:
                    logger.error("❌ Max retries exceeded. Please check your database configuration.")
                    return False
        
        logger.error(f"❌ Failed to connect after {MAX_RETRIES} attempts")
        return False

    def get_connection(self):
        """Get a connection from the pool"""
        if not self._is_connected or not self._pool:
            raise RuntimeError("Database not connected. Call connect() first.")
        
        try:
            return self._pool.getconn()
        except Exception as e:
            logger.error(f"❌ Failed to get connection from pool: {e}")
            raise
    
    def return_connection(self, conn):
        """Return a connection to the pool"""
        if self._pool and conn:
            self._pool.putconn(conn)
    
    @contextmanager
    def get_cursor(self, dict_cursor: bool = False):
        """Context manager for database cursors"""
        conn = None
        try:
            conn = self.get_connection()
            cursor_factory = RealDictCursor if dict_cursor else None
            with conn.cursor(cursor_factory=cursor_factory) as cursor:
                yield cursor
                conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"❌ Database operation failed: {e}")
            raise
        finally:
            if conn:
                self.return_connection(conn)
    
    def health_check(self) -> dict:
        """Check database health status"""
        status = {
            "connected": self._is_connected,
            "pool_active": self._pool is not None,
            "attempts": self._connection_attempts,
            "was_sleeping": self._was_sleeping,
            "healthy": False,
            "server_time": None
        }
        
        if self._is_connected and self._pool:
            try:
                with self.get_cursor(dict_cursor=True) as cursor:
                    cursor.execute("SELECT NOW() as server_time;")
                    result = cursor.fetchone()
                    
                    if result and "server_time" in result:
                        status["server_time"] = str(result["server_time"])
                        status["healthy"] = True
            except Exception as e:
                status["error"] = str(e)
                logger.warning(f"⚠️ Health check verification failed: {e}")
        
        return status
            
    def close(self):
        """Close all database connections"""
        if self._pool:
            self._pool.closeall()
            logger.info("🔒 All database connections closed")
        self._is_connected = False
        self._pool = None
    
    def get_stats(self) -> dict:
        """Get connection pool statistics"""
        if self._pool and self._is_connected:
            used_connections = len(self._pool._used) if hasattr(self._pool, '_used') else 0
            available_connections = len(self._pool._pool) if hasattr(self._pool, '_pool') else 0
            total_size = used_connections + available_connections
            return {
                "min_connections": POOL_MIN_CONNECTIONS,
                "max_connections": POOL_MAX_CONNECTIONS,
                "active_connections": used_connections,
                "available_connections": available_connections,
                "total_pool_size": total_size,
                "is_connected": self._is_connected,
                "attempts": self._connection_attempts,
                "was_sleeping": self._was_sleeping
            }
        return {
            "is_connected": self._is_connected,
            "pool_active": self._pool is not None
        }


# ======================================================
# SINGLETON INSTANCE
# ======================================================
_db_manager = None


def get_db() -> DatabaseManager:
    """Get or create the singleton database manager"""
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
        _db_manager.connect()
    return _db_manager


# ======================================================
# CONVENIENCE FUNCTIONS
# ======================================================
def db_connect():
    db = get_db()
    return db


def db_health():
    db = get_db()
    return db.health_check()


def db_stats():
    db = get_db()
    return db.get_stats()


def db_close():
    global _db_manager
    if _db_manager:
        _db_manager.close()
        _db_manager = None


# ======================================================
# BACKEND INTEGRATION - FastAPI LIFESPAN
# ======================================================
async def startup_db():
    """Initialize database on application startup"""
    logger.info("🚀 Initializing database connection...")
    db = get_db()
    if db._is_connected:
        logger.info("✅ Database connection established")
        stats = db.get_stats()
        logger.info(f"📊 Connection pool stats: {stats}")
        health = db.health_check()
        if health.get("healthy"):
            logger.info("✅ Database health check passed")
        else:
            logger.warning(f"⚠️ Database health check: {health}")
    else:
        logger.error("❌ Failed to establish database connection on startup")
    return db


async def shutdown_db():
    """Close database connections on application shutdown"""
    logger.info("🔒 Closing database connections...")
    db_close()
    logger.info("✅ Database connections closed")


# =====================================================
# FASTAPI DEPENDENCY - ASYNC DATABASE SESSION
# ======================================================
async def init_async_db_engine():
    """Initialize the async SQLAlchemy engine once."""
    global _async_engine, _AsyncSessionLocal
    if _async_engine is None:
        engine_url, connect_args = normalize_database_url(os.getenv("DATABASE_URL") or DATABASE_URL)
        _async_engine = create_async_engine(engine_url, pool_pre_ping=True, echo=False, connect_args=connect_args)
        _AsyncSessionLocal = sessionmaker(
            bind=_async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_engine


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async SQLAlchemy session for FastAPI dependency injection."""
    await init_async_db_engine()
    async with _AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_db_cursor(dict_cursor: bool = False):
    """
    FastAPI dependency for database cursors with optional dict mode.
    
    Yields a database cursor for use in endpoint handlers.
    The cursor and connection are automatically cleaned up after the request.
    """
    db = get_db()
    conn = None
    cursor = None
    try:
        conn = db.get_connection()
        cursor_factory = RealDictCursor if dict_cursor else None
        cursor = conn.cursor(cursor_factory=cursor_factory)
        yield cursor
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"❌ Database cursor error: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            db.return_connection(conn)


# ======================================================
# FASTAPI DEPENDENCY - CURSOR
# ======================================================
def get_db_cursor(dict_cursor: bool = True):
    """
    FastAPI dependency for database cursors.
    
    Yields a database cursor for use in endpoint handlers.
    The cursor and connection are automatically cleaned up after the request.
    """
    db = get_db()
    conn = None
    try:
        conn = db.get_connection()
        cursor_factory = RealDictCursor if dict_cursor else None
        with conn.cursor(cursor_factory=cursor_factory) as cursor:
            yield cursor
            conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"❌ Database cursor error: {e}")
        raise
    finally:
        if conn:
            db.return_connection(conn)