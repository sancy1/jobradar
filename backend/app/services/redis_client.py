
# jobradar/backend/app/services/redis_client.py

"""
Redis Connection Client for JobRadar
Aiven Valkey with SASL (Username + Password) + Client Certificate Authentication
"""

import os
import json
import logging
from typing import Optional, Any, Dict

import redis
from redis import Redis
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ======================================================
# CONFIGURATION - UPDATED WITH WORKING CREDENTIALS
# ======================================================
REDIS_HOST = os.getenv("REDIS_HOST", "jobradar-redis-jobradar-redis.c.aivencloud.com")
REDIS_PORT = int(os.getenv("REDIS_PORT", 25164))
REDIS_USERNAME = os.getenv("REDIS_USERNAME", "default")  # ← Changed from avnadmin to default
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")  # Required for Aiven SASL auth

# Certificate files
REDIS_CA_CERT = os.getenv("REDIS_SSL_CA_CERT", "certs/ca.pem")
REDIS_CLIENT_CERT = os.getenv("REDIS_SSL_CERT", "certs/service.cert")
REDIS_CLIENT_KEY = os.getenv("REDIS_SSL_KEY", "certs/service.key")

# Redis databases
REDIS_DB_SESSION = 0        # Session state
REDIS_DB_CELERY_BROKER = 1  # Celery broker
REDIS_DB_CELERY_BACKEND = 2 # Celery results
REDIS_DB_CACHE = 3          # Query cache
REDIS_DB_RATE_LIMIT = 4     # Rate limiting

MAX_RETRIES = 5
RETRY_DELAY = 2


# ======================================================
# REDIS CLIENT MANAGER
# ======================================================
class RedisClient:
    """Redis connection manager for Aiven with SASL + Certificate auth"""
    
    def __init__(self):
        self._clients: Dict[int, Redis] = {}
        self._is_connected = False
    
    def _create_connection_params(self, db: int = 0) -> dict:
        """Create connection parameters for Aiven Redis"""
        params = {
            'host': REDIS_HOST,
            'port': REDIS_PORT,
            'username': REDIS_USERNAME,
            'password': REDIS_PASSWORD,
            'ssl': True,
            'ssl_ca_certs': REDIS_CA_CERT,
            'ssl_certfile': REDIS_CLIENT_CERT,
            'ssl_keyfile': REDIS_CLIENT_KEY,
            'ssl_cert_reqs': 'required',
            'decode_responses': True,
            'db': db,
            'socket_timeout': 30,
            'socket_connect_timeout': 10,
            'retry_on_timeout': True,
            'health_check_interval': 30,
            'socket_keepalive': True,
        }
        
        # Validate required config
        if not REDIS_PASSWORD:
            logger.warning("⚠️ REDIS_PASSWORD not set in .env file!")
        
        return params
    
    def connect(self, db: int = REDIS_DB_SESSION) -> Optional[Redis]:
        """Connect to Redis with retry logic"""
        
        params = self._create_connection_params(db)
        
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                logger.info(f"🔄 Connecting to Aiven Redis (attempt {attempt}/{MAX_RETRIES})...")
                
                client = redis.Redis(**params)
                
                # Test connection
                client.ping()
                version = client.info().get('redis_version', 'unknown')
                logger.info(f"✅ Redis connected (version: {version})")
                
                self._clients[db] = client
                self._is_connected = True
                logger.info(f"📊 Redis: {REDIS_HOST}:{REDIS_PORT}, DB: {db}")
                
                return client
                
            except redis.ConnectionError as e:
                logger.warning(f"⚠️ Connection attempt {attempt} failed: {e}")
                if attempt < MAX_RETRIES:
                    import time
                    time.sleep(RETRY_DELAY * attempt)
                    
            except redis.AuthenticationError as e:
                logger.error(f"❌ Authentication failed: {e}")
                logger.info("💡 Check REDIS_USERNAME and REDIS_PASSWORD in .env")
                return None
                
            except Exception as e:
                logger.error(f"❌ Redis error: {e}")
                if attempt < MAX_RETRIES:
                    import time
                    time.sleep(RETRY_DELAY)
        
        logger.error(f"❌ Failed to connect after {MAX_RETRIES} attempts")
        return None
    
    def get_client(self, db: int = REDIS_DB_SESSION) -> Optional[Redis]:
        """Get Redis client for specific database"""
        if db not in self._clients:
            return self.connect(db)
        return self._clients.get(db)
    
    def get(self, key: str, db: int = REDIS_DB_SESSION) -> Optional[str]:
        client = self.get_client(db)
        if client:
            return client.get(key)
        return None
    
    def set(self, key: str, value: Any, ttl: int = None, db: int = REDIS_DB_SESSION) -> bool:
        client = self.get_client(db)
        if not client:
            return False
        if not isinstance(value, str):
            value = json.dumps(value)
        if ttl:
            return client.setex(key, ttl, value)
        return client.set(key, value)
    
    def delete(self, key: str, db: int = REDIS_DB_SESSION) -> bool:
        client = self.get_client(db)
        if client:
            return client.delete(key) > 0
        return False
    
    def exists(self, key: str, db: int = REDIS_DB_SESSION) -> bool:
        client = self.get_client(db)
        if client:
            return client.exists(key) > 0
        return False
    
    def incr(self, key: str, amount: int = 1, db: int = REDIS_DB_SESSION) -> int:
        client = self.get_client(db)
        if client:
            return client.incr(key, amount)
        return 0
    
    def expire(self, key: str, ttl: int, db: int = REDIS_DB_SESSION) -> bool:
        client = self.get_client(db)
        if client:
            return client.expire(key, ttl)
        return False
    
    def hset(self, key: str, mapping: dict, db: int = REDIS_DB_SESSION) -> int:
        client = self.get_client(db)
        if client:
            return client.hset(key, mapping=mapping)
        return 0
    
    def hgetall(self, key: str, db: int = REDIS_DB_SESSION) -> dict:
        client = self.get_client(db)
        if client:
            return client.hgetall(key)
        return {}
    
    def hget(self, key: str, field: str, db: int = REDIS_DB_SESSION) -> Optional[str]:
        client = self.get_client(db)
        if client:
            return client.hget(key, field)
        return None
    
    def publish(self, channel: str, message: Any, db: int = REDIS_DB_SESSION) -> int:
        client = self.get_client(db)
        if client:
            if not isinstance(message, str):
                message = json.dumps(message)
            return client.publish(channel, message)
        return 0
    
    def subscribe(self, channel: str, db: int = REDIS_DB_SESSION):
        client = self.get_client(db)
        if client:
            pubsub = client.pubsub()
            pubsub.subscribe(channel)
            return pubsub
        return None
    
    def ping(self, db: int = REDIS_DB_SESSION) -> bool:
        client = self.get_client(db)
        if client:
            try:
                return client.ping()
            except:
                return False
        return False
    
    def close(self):
        for client in self._clients.values():
            try:
                client.close()
            except:
                pass
        self._clients.clear()
        self._is_connected = False
        logger.info("🔒 Redis connections closed")
    
    def health_check(self) -> dict:
        status = {
            "connected": self._is_connected,
            "active_connections": len(self._clients),
            "host": REDIS_HOST,
            "port": REDIS_PORT,
            "ssl": True,
            "has_password": bool(REDIS_PASSWORD),
        }
        
        for db in self._clients:
            try:
                status[f"db_{db}_ping"] = self.ping(db)
            except:
                status[f"db_{db}_ping"] = False
        
        status["healthy"] = all(
            status.get(f"db_{db}_ping", False) 
            for db in self._clients
        ) if self._clients else False
        
        return status


# ======================================================
# SINGLETON INSTANCE
# ======================================================
_redis_client = None


def get_redis() -> RedisClient:
    global _redis_client
    if _redis_client is None:
        _redis_client = RedisClient()
        _redis_client.connect()
    return _redis_client


def redis_health():
    return get_redis().health_check()


def redis_close():
    global _redis_client
    if _redis_client:
        _redis_client.close()
        _redis_client = None


async def startup_redis():
    logger.info("🚀 Initializing Redis connection...")
    redis_client = get_redis()
    if redis_client._is_connected:
        logger.info("✅ Redis connected successfully")
    else:
        logger.warning("⚠️ Redis connection failed - continuing without Redis")
        logger.warning("   Features requiring Redis (rate limiting, caching) will be disabled")
    return redis_client


async def shutdown_redis():
    logger.info("🔒 Closing Redis connections...")
    redis_close()