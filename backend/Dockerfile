# ============================================================
# DEVELOPMENT BUILD STAGE
# ============================================================
FROM python:3.11-slim AS builder

# Install system dependencies needed for compiling extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PIP_NO_INPUT=1 \
    PIP_NO_WARN_SCRIPT_LOCATION=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

# Copy requirements first for optimized Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --target=/opt/venv -r requirements.txt

# ============================================================
# RUNTIME STAGE
# ============================================================
FROM python:3.11-slim

# Prevent Python from writing .pyc files and force unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH="/opt/venv:/app" \
    PATH="/opt/venv/bin:/usr/local/bin:/usr/bin:/bin"

WORKDIR /app

# Install native production runtime dependencies and curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Securely provision non-root service runtime user account
RUN useradd -m -u 1000 jobradar

# Copy dependencies from builder with correct ownership
COPY --from=builder --chown=jobradar:jobradar /opt/venv /opt/venv

# Copy application source file workspace trees into the container
COPY --chown=jobradar:jobradar . .

# Provision fallback logs directory and transfer environment ownership privileges cleanly
RUN mkdir -p /app/logs && chown -R jobradar:jobradar /app

USER jobradar

# Health check pipeline verifying runtime API state
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose target networking interface communication port
EXPOSE 8000

# ✅ FIXED: Run python module explicitly with local hot-reloading active
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
