#!/usr/bin/env bash
set -e

# Wait for DB to be available (simple loop)
echo "Running entrypoint: migrate, collectstatic, then start gunicorn"

python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear

# Start gunicorn using PORT env var (Railway/Heroku-style)
: ${PORT:=8080}
echo "Starting gunicorn on 0.0.0.0:${PORT}"
exec gunicorn bluewardrobe.wsgi:application --bind 0.0.0.0:${PORT} --workers 3 --threads 3 --log-level info
