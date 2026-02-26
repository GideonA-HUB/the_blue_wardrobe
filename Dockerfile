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

# Collect static files
RUN python backend/manage.py collectstatic --noinput || true

# ✅ THIS IS THE KEY FIX
CMD sh -c "gunicorn --chdir backend bluewardrobe.wsgi:application --bind 0.0.0.0:$PORT"
