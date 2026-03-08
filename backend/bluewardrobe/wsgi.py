import os
import sys
import traceback
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')

django_application = get_wsgi_application()


def application(environ, start_response):
    try:
        return django_application(environ, start_response)
    except BaseException:
        traceback.print_exc(file=sys.stderr)
        path_info = environ.get('PATH_INFO', '')
        if path_info.startswith('/health'):
            body = b'{"status": "error", "detail": "Unhandled application error"}'
            status = '500 Internal Server Error'
            headers = [
                ('Content-Type', 'application/json'),
                ('Content-Length', str(len(body))),
            ]
        else:
            body = b'Application error'
            status = '500 Internal Server Error'
            headers = [
                ('Content-Type', 'text/plain; charset=utf-8'),
                ('Content-Length', str(len(body))),
            ]
        start_response(status, headers)
        return [body]
