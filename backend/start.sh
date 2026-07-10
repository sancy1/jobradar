#!/bin/bash
# Production start script for Render
set -e

cd /app

# Run the FastAPI application with uvicorn
# The app.main module already handles logging configuration via the monkey-patch
exec python -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --log-level info \
    --access-log