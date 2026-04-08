#!/usr/bin/env sh
set -eu

python manage.py migrate --noinput

exec gunicorn bluewardrobe.wsgi:application --bind 0.0.0.0:${PORT:-8080}
