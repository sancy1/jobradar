#!/bin/bash
# Production start script for Render
# Bypasses Render's --log-config /dev/null injection

cd /app

# Patch logging and run the app
exec python -c "
import sys
import logging
import logging.config

# Monkey-patch fileConfig to ignore /dev/null
_original = logging.config.fileConfig
def _patched(fname, *args, **kwargs):
    if fname == '/dev/null' or (isinstance(fname, str) and fname.endswith('/dev/null')):
        logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
        return
    return _original(fname, *args, **kwargs)
logging.config.fileConfig = _patched

# Now run the app
from app.main import app
import uvicorn
uvicorn.run(app, host='0.0.0.0', port=8000, log_config=None, log_level='info')
"