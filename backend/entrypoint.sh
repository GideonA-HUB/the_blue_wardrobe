#!/usr/bin/env bash
set -euo pipefail

echo "Entrypoint: waiting for DB, running migrations, collectstatic, then starting gunicorn"

# Ensure DJANGO_SETTINGS_MODULE is set. If not provided, try to auto-detect
# the Django project package by looking for a subdirectory containing wsgi.py.
if [ -z "${DJANGO_SETTINGS_MODULE:-}" ]; then
	PROJECT_MODULE=""
	for d in */ ; do
		if [ -f "$d/wsgi.py" ]; then
			PROJECT_MODULE=$(basename "${d%/}")
			break
		fi
	done
	if [ -n "$PROJECT_MODULE" ]; then
		export DJANGO_SETTINGS_MODULE="${PROJECT_MODULE}.settings"
		export WSGI_MODULE="${PROJECT_MODULE}.wsgi"
		echo "Auto-detected Django project: ${PROJECT_MODULE}, using DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE}"
	else
		# Fallback to a sensible default (keep backwards compatibility)
		export DJANGO_SETTINGS_MODULE="bluewardrobe.settings"
		export WSGI_MODULE="bluewardrobe.wsgi"
		echo "Could not auto-detect Django project directory; falling back to DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE}"
	fi
else
	export WSGI_MODULE="${DJANGO_SETTINGS_MODULE%.*}.wsgi"
	echo "Using provided DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE}, WSGI_MODULE=${WSGI_MODULE}"
fi

# Simple DB wait loop using Django DB connection
echo "Waiting for database to become available..."
python - <<'PY'
import os, sys, time
os.environ.setdefault('DJANGO_SETTINGS_MODULE', os.environ.get('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings'))
try:
	import django
	django.setup()
	from django.db import connections
except Exception as e:
	print('Django not ready to check DB:', e)
	sys.exit(1)

timeout = int(os.environ.get('DB_WAIT_TIMEOUT', '180'))
interval = 2
start = time.time()
while True:
	try:
		connections['default'].cursor()
		print('Database available')
		break
	except Exception as exc:
		elapsed = time.time() - start
		if elapsed > timeout:
			print(f'Could not connect to DB after {timeout}s, exiting. Last error: {exc}')
			sys.exit(1)
		print('DB unavailable, sleeping', interval, 's:', exc)
		time.sleep(interval)
    
PY

# Run migrations and collectstatic
echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
# Avoid --clear here to prevent removing previously-built frontend assets unexpectedly.
python manage.py collectstatic --noinput

# Start gunicorn using PORT env var (Railway/Heroku-style)
: ${PORT:=8080}
echo "Starting gunicorn on 0.0.0.0:${PORT} (WSGI=${WSGI_MODULE}:application)"
# Use access/error logging to stdout so Railway captures request errors and tracebacks.
exec gunicorn ${WSGI_MODULE}:application \
	--bind 0.0.0.0:${PORT} \
	--workers 3 \
	--threads 3 \
	--log-level info \
	--access-logfile - \
	--error-logfile - \
	--capture-output
