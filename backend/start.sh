#!/usr/bin/env sh
set -eu

python manage.py check
python manage.py migrate --noinput
python manage.py runtime_smoke

exec gunicorn bluewardrobe.wsgi:application -c gunicorn.conf.py
