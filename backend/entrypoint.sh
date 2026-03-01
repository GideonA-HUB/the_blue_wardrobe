#!/usr/bin/env bash
set -euo pipefail

echo "Entrypoint: waiting for DB, running migrations, collectstatic, then starting gunicorn"

# Ensure DJANGO_SETTINGS_MODULE is set
: ${DJANGO_SETTINGS_MODULE:=bluewardrobe.settings}
export DJANGO_SETTINGS_MODULE

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
echo "Starting gunicorn on 0.0.0.0:${PORT}"
# Use access/error logging to stdout so Railway captures request errors and tracebacks.
exec gunicorn bluewardrobe.wsgi:application \
	--bind 0.0.0.0:${PORT} \
	--workers 3 \
	--threads 3 \
	--log-level info \
	--access-logfile - \
	--error-logfile - \
	--capture-output
