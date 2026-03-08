### Clean multi-stage Dockerfile
# Stage: frontend builder
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install to leverage build cache
COPY frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY frontend/ ./
RUN npm run build

# Stage: python runtime
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=bluewardrobe.settings

# System deps required for runtime connectivity
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy backend and built frontend artifacts from builder
COPY backend/ /app/
COPY --from=frontend-builder /app/frontend/dist /app/frontend_dist

# Ensure runtime scripts exist and are executable
RUN chmod +x /app/start.sh

# Validate Django configuration during build so request-time import failures
# surface before deployment
RUN python manage.py check

# Collect static files during image build for a simpler runtime startup
RUN python manage.py collectstatic --noinput

EXPOSE 8080

CMD ["/app/start.sh"]
