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

# ---------- Backend ----------
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --upgrade pip && pip install -r backend/requirements.txt

COPY backend ./backend

# Copy entrypoint and make executable
COPY backend/entrypoint.sh ./backend/entrypoint.sh
RUN chmod +x ./backend/entrypoint.sh

# Collect static files (build-time, best-effort)
RUN python backend/manage.py collectstatic --noinput || true

# Set working directory to backend so manage.py is accessible to entrypoint
WORKDIR /app/backend

# Use entrypoint to run migrations, collectstatic and start gunicorn
ENTRYPOINT ["/app/backend/entrypoint.sh"]
