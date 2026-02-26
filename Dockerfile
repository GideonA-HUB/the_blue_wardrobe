FROM python:3.11-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# ---------------------
# Frontend build
# ---------------------
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# ---------------------
# Backend setup
# ---------------------
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY backend ./backend

# Collect static files
RUN python backend/manage.py collectstatic --noinput || true

# Start app
CMD sh -c "gunicorn bluewardrobe.wsgi:application --bind 0.0.0.0:$PORT"
