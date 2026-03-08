import os

bind = f"0.0.0.0:{os.getenv('PORT', '8080')}"
workers = int(os.getenv('GUNICORN_WORKERS', '1'))
worker_class = 'sync'
timeout = int(os.getenv('GUNICORN_TIMEOUT', '60'))
forwarded_allow_ips = os.getenv('FORWARDED_ALLOW_IPS', '*')
proxy_allow_ips = os.getenv('PROXY_ALLOW_IPS', '*')
secure_scheme_headers = {
    'X-FORWARDED-PROTO': 'https',
}
accesslog = '-'
errorlog = '-'
loglevel = os.getenv('GUNICORN_LOG_LEVEL', 'debug')
capture_output = True
