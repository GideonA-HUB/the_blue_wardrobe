import os
import sys
import traceback
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluewardrobe.settings')

django_application = get_wsgi_application()


def application(environ, start_response):
    method = environ.get('REQUEST_METHOD', 'GET')
    path_info = environ.get('PATH_INFO', '')
    print(f"WSGI request start: {method} {path_info}", file=sys.stdout, flush=True)

    def logging_start_response(status, headers, exc_info=None):
        print(f"WSGI response: {method} {path_info} -> {status}", file=sys.stdout, flush=True)
        return start_response(status, headers, exc_info)

    try:
        return django_application(environ, logging_start_response)
    except BaseException:
        traceback.print_exc(file=sys.stderr)
        body = b'Application error'
        status = '500 Internal Server Error'
        headers = [
            ('Content-Type', 'text/plain; charset=utf-8'),
            ('Content-Length', str(len(body))),
        ]
        logging_start_response(status, headers)
        return [body]
