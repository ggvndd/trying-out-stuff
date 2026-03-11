# ==========================================
# Stage 1: Builder
# ==========================================

# This example use slim, but use alpine whenever possible.
FROM python:3.11-slim as builder 

# Set environment variables for build
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /build

# Install build dependencies (needed for compiling libraries like uvloop or orjson if pre-built wheels are missing)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc build-essential && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install them into a virtual environment
COPY requirements.txt .
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# ==========================================
# Stage 2: Production Final
# ==========================================

# This example use slim, but use alpine whenever possible.
FROM python:3.11-slim

# Security & Optimization Environment Variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Create a non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy the pre-built virtual environment from the builder stage
COPY --from=builder --chown=appuser:appgroup /opt/venv /opt/venv

# Copy the application code
COPY --chown=appuser:appgroup . .

# Switch to the non-root user
USER appuser

# Expose the application port
EXPOSE 8000

# Run the application using the Gunicorn production config
CMD ["gunicorn", "-c", "gunicorn_conf.py", "main:app"]
