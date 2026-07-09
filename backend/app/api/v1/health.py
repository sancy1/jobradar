# jobradar/backend/app/api/v1/health.py

"""
Database Health Check and Remote Wakeup Router Endpoint Verification Module
"""

from fastapi import APIRouter
from datetime import datetime
from app.services.database import db_health, db_stats, get_db

router = APIRouter()


@router.get(
    "/health/db",
    summary="Database health check",
    description="Check active thread availability and database connection status"
)
async def db_health_check():
    """Verify live connectivity states, tracking metrics, and cluster health status"""
    health = db_health()
    stats = db_stats()
    
    return {
        "status": "healthy" if health.get("healthy") else "unhealthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "database": {
            "connected": health.get("connected", False),
            "healthy": health.get("healthy", False),
            "was_sleeping": health.get("was_sleeping", False),
            "connection_attempts": health.get("attempts", 0),
            "server_time": health.get("server_time"),
            "pool": stats
        }
    }


@router.get(
    "/health/db/ping",
    summary="Ping database",
    description="Force a database ping handshake sequence to awaken a serverless compute node"
)
async def ping_database():
    """Trigger an out-of-band validation check against the remote cloud cluster"""
    db = get_db()
    conn_params = db._parse_db_url()
    
    start_time = datetime.utcnow()
    # Corrected: Call the public, internal instance helper method natively attached to your singleton instance
    result = db._ping_database(conn_params)
    elapsed = (datetime.utcnow() - start_time).total_seconds()
    
    return {
        "success": result,
        "elapsed_seconds": elapsed,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "message": "Database ping validation successful" if result else "Database proxy cluster handshake failed"
    }


@router.get(
    "/health/db/stats",
    summary="Database connection stats",
    description="Fetch detailed metrics from the live multithreaded connection pool"
)
async def db_stats_endpoint():
    """Get active connection pool telemetry allocation metrics"""
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "stats": db_stats()
    }
