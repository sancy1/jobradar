#!/usr/bin/env python3
"""
Production start script for Render
Completely bypasses Render's --log-config /dev/null injection
"""

import sys
import os
import logging
import logging.config

# ============================================================
# PATCH: Disable fileConfig before ANYTHING else
# ============================================================
_original_fileConfig = logging.config.fileConfig

def _patched_fileConfig(fname, *args, **kwargs):
    if fname == '/dev/null' or (isinstance(fname, str) and fname.endswith('/dev/null')):
        logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
        return
    return _original_fileConfig(fname, *args, **kwargs)

logging.config.fileConfig = _patched_fileConfig

# ============================================================
# Now import and run the app
# ============================================================
sys.path.insert(0, '/app')
sys.path.insert(0, os.getcwd())

from app.main import app
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting JobRadar with start.py...", file=sys.stdout)
    print(f"📂 Working directory: {os.getcwd()}", file=sys.stdout)
    print(f"📂 Python path: {sys.path[:3]}", file=sys.stdout)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_config=None,
        log_level="info",
        access_log=True
    )