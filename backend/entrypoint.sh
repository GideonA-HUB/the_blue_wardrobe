#!/usr/bin/env bash
set -euo pipefail

echo "Entrypoint: waiting for DB, running migrations, collectstatic, then starting gunicorn"

# Quick debug mode: if USE_DEBUG_SERVER=true is set in the environment,
# start a minimal Python HTTP server bound to $PORT and exit. This helps
# determine whether Railway's proxy/routing is working independently of Django.
if [ "${USE_DEBUG_SERVER:-false}" = "true" ]; then
	echo "DEBUG MODE: starting simple HTTP server on port ${PORT:-8080}"
	# Serve the current directory (backend) root. This returns 200 for / and /favicon.ico
	python -m http.server ${PORT:-8080} --bind 0.0.0.0
	exit 0
fi

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
# For troubleshooting, use the sync worker class which is simpler and more predictable
# on small hosts. If you need concurrency later, switch back to gthread or guncorn defaults.
exec gunicorn ${WSGI_MODULE}:application \
	--bind 0.0.0.0:${PORT} \
	--workers 1 \
	--worker-class sync \
	--timeout 30 \
	--log-level debug \
	--access-logfile - \
	--error-logfile - \
	--capture-output
