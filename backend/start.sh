#!/bin/bash
# Production bootstrap script for Render
set -e

# Change into the designated container deployment directory
cd /app

# Explicitly ensure paths are exposed to the shell environment
export PYTHONPATH="/opt/venv:/app:${PYTHONPATH}"
export PATH="/opt/venv/bin:${PATH}"

# If you use Alembic migrations in production, uncomment the line below:
# alembic upgrade head

# Handoff process execution cleanly over to the patched Python engine
echo "🚀 Bootstrapping application via start.py..."
exec python start.py
