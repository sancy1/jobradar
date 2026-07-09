"""
Simple Redis Connection Test
Run: python -m tests.test_redis_simple
"""

import os
import redis
from dotenv import load_dotenv

load_dotenv()

# Use environment variables instead of hardcoded values
HOST = os.getenv("REDIS_HOST", "jobradar-redis-jobradar-redis.c.aivencloud.com")
PORT = int(os.getenv("REDIS_PORT", 25164))
USERNAME = os.getenv("REDIS_USERNAME", "default")
PASSWORD = os.getenv("REDIS_PASSWORD")  # ← Load from .env

CA_CERT = os.getenv("REDIS_SSL_CA_CERT", "certs/ca.pem")
CLIENT_CERT = os.getenv("REDIS_SSL_CERT", "certs/service.cert")
CLIENT_KEY = os.getenv("REDIS_SSL_KEY", "certs/service.key")

print("🔌 Simple Redis Connection Test...")
print(f"Host: {HOST}")
print(f"Port: {PORT}")
print(f"Username: {USERNAME}")
print(f"Password: {'*' * 8 if PASSWORD else 'NOT SET'}")
print()

if not PASSWORD:
    print("❌ REDIS_PASSWORD not set in .env file")
    exit(1)

# Try with certificate + SASL
try:
    client = redis.Redis(
        host=HOST,
        port=PORT,
        username=USERNAME,
        password=PASSWORD,
        ssl=True,
        ssl_ca_certs=CA_CERT,
        ssl_certfile=CLIENT_CERT,
        ssl_keyfile=CLIENT_KEY,
        ssl_cert_reqs='required',
        decode_responses=True,
        socket_timeout=10,
        socket_connect_timeout=10,
    )
    
    print("📡 Pinging Redis...")
    result = client.ping()
    print(f"✅ SUCCESS! Ping: {result}")
    
    info = client.info()
    print(f"📊 Redis Version: {info.get('redis_version')}")
    print("🎉 Connection successful!")
    
except Exception as e:
    print(f"❌ Failed: {e}")
    print(f"Type: {type(e).__name__}")