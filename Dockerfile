### Clean multi-stage Dockerfile
# Stage: frontend builder
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install to leverage build cache
COPY frontend/package*.json ./
COPY frontend/package-lock.json ./
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# Copy source and build
COPY frontend/ ./
RUN npm run build --silent

# Stage: python runtime
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System deps required for building some Python packages and DB client
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --upgrade pip && pip install --no-cache-dir -r backend/requirements.txt

# Copy backend and built frontend artifacts from builder
COPY backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./backend/frontend_dist
# Also make the built frontend available at /app/frontend/dist (this is what
# `bluewardrobe.settings` checks for via BASE_DIR.parent / 'frontend' / 'dist')
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Also copy built frontend into other common locations used by different projects
RUN mkdir -p backend/frontend/dist && cp -r backend/frontend_dist/* backend/frontend/dist/ || true
RUN mkdir -p backend/templates && cp -r backend/frontend_dist/* backend/templates/ || true

# Ensure entrypoint exists and is executable
COPY backend/entrypoint.sh ./backend/entrypoint.sh
RUN chmod +x ./backend/entrypoint.sh

WORKDIR /app/backend

ENTRYPOINT ["/app/backend/entrypoint.sh"]
