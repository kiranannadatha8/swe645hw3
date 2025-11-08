# syntax=docker/dockerfile:1.6

FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps kept minimal (only build-essential if you truly need it)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
  && rm -rf /var/lib/apt/lists/*

# ---- install python deps
COPY requirements.txt .
# Tip: pin versions in requirements.txt; include gunicorn and uvicorn
# Example extras: fastapi[all] gunicorn uvicorn pymysql
RUN pip install --no-cache-dir -r requirements.txt

# ---- copy app
COPY app ./app

# ---- security: create non-root user
RUN useradd -u 10001 -m appuser

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Healthcheck endpoint should exist in app (/healthz)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/healthz || exit 1

# Gunicorn with uvicorn worker: scale with K8s (2 workers is a safe default for small pods)
CMD ["gunicorn", "app.main:app", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "-w", "2", "-b", "0.0.0.0:8000", \
     "--access-logfile=-", "--error-logfile=-"]
