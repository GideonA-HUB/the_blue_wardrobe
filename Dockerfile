### Multi-stage Dockerfile
# Stage 1: Build frontend using a lightweight Node image
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy only package files first to leverage layer caching
COPY frontend/package*.json ./
COPY frontend/package-lock.json ./

RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# Copy the rest of the frontend sources and build
COPY frontend/ ./
RUN npm run build --silent


# Stage 2: Python runtime
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System deps required to build some Python packages and postgres client
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --upgrade pip && pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application
COPY backend ./backend

# Copy the built frontend from the builder stage into the backend as `frontend_dist`
# This matches HEDDIEKITCHEN/bluewardrobe convention where the backend expects
# a `frontend_dist` (or frontend/dist) directory to serve index.html or include
# the React build in static/template locations.
COPY --from=frontend-builder /app/frontend/dist ./backend/frontend_dist

# Ensure entrypoint is present and executable
COPY backend/entrypoint.sh ./backend/entrypoint.sh
RUN chmod +x ./backend/entrypoint.sh

# Make backend the working dir
WORKDIR /app/backend

# Entrypoint will wait for DB, run migrations, collectstatic and start gunicorn
ENTRYPOINT ["/app/backend/entrypoint.sh"]
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System deps
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---------- Frontend ----------
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Ensure the built frontend index.html is available to Django templates at runtime.
# Copy the frontend build into the backend templates directory so TemplateView can
# always find index.html even if collectstatic/other runtime steps vary.
RUN mkdir -p backend/templates && cp -r frontend/dist/* backend/templates/ || true

# ---------- Backend ----------
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --upgrade pip && pip install -r backend/requirements.txt

COPY backend ./backend

# Copy entrypoint and make executable
COPY backend/entrypoint.sh ./backend/entrypoint.sh
RUN chmod +x ./backend/entrypoint.sh

# NOTE: We intentionally DO NOT run collectstatic at build-time here.
# Running collectstatic at build-time can cause stale/deleted files when the
# container later runs collectstatic at startup. We rely on the entrypoint
# to run migrations and collectstatic when the container starts (runtime).

# Set working directory to backend so manage.py is accessible to entrypoint
WORKDIR /app/backend

# Use entrypoint to run migrations, collectstatic and start gunicorn
ENTRYPOINT ["/app/backend/entrypoint.sh"]
