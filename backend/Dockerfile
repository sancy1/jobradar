# jobradar/backend/Dockerfile

# ============================================================
# BUILD STAGE
# ============================================================
FROM python:3.11-slim AS builder

# Install system dependencies needed for compiling extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for optimized Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ============================================================
# RUNTIME STAGE
# ============================================================
FROM python:3.11-slim

# Prevent Python from writing .pyc files and force unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/home/jobradar/.local/bin:${PATH}"

WORKDIR /app

# Install native production runtime dependencies and curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Securely provision non-root service runtime user account
RUN useradd -m -u 1000 jobradar

# Copy installed site-packages layer and binary definitions from builder stage
COPY --from=builder /root/.local /home/jobradar/.local

# Copy application source file workspace trees into the container
COPY . .

# Provision fallback logs directory and transfer environment ownership privileges cleanly
RUN mkdir -p /app/logs && chown -R jobradar:jobradar /app
USER jobradar

# Health check pipeline verifying runtime API state
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose target networking interface communication port
EXPOSE 8000

# Default application execution command bypassing native uvicorn log configuration overrides
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-config", "/dev/null"]
