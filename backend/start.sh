#!/usr/bin/env sh
set -eu

echo "TBW start.sh active"
python -c "import gunicorn; print(f'TBW gunicorn version: {gunicorn.__version__}')"

python manage.py check
python manage.py migrate --noinput
python manage.py runtime_smoke

exec gunicorn bluewardrobe.wsgi:application -c gunicorn.conf.py
