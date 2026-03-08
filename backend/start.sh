#!/usr/bin/env sh
set -eu

python manage.py migrate --noinput

exec gunicorn bluewardrobe.wsgi:application -c gunicorn.conf.py
