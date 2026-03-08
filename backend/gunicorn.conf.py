import os

bind = f"0.0.0.0:{os.getenv('PORT', '8080')}"
workers = int(os.getenv('GUNICORN_WORKERS', '1'))
worker_class = 'sync'
timeout = int(os.getenv('GUNICORN_TIMEOUT', '60'))
accesslog = '-'
errorlog = '-'
loglevel = os.getenv('GUNICORN_LOG_LEVEL', 'debug')
capture_output = True
