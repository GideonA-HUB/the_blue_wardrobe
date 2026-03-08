from django.core.management.base import BaseCommand, CommandError
from django.test import Client


class Command(BaseCommand):
    help = 'Runs an in-process smoke test against key public routes before serving traffic.'

    def handle(self, *args, **options):
        client = Client(HTTP_HOST='localhost')

        root_response = client.get('/')
        self.stdout.write(f"Runtime smoke '/': {root_response.status_code}")
        if root_response.status_code != 200:
            body = (root_response.content or b'')[:400].decode('utf-8', errors='replace')
            raise CommandError(
                f"Runtime smoke test failed for '/': status={root_response.status_code}, body={body!r}"
            )

        favicon_response = client.get('/favicon.ico')
        self.stdout.write(f"Runtime smoke '/favicon.ico': {favicon_response.status_code}")
        if favicon_response.status_code not in {200, 204, 301, 302}:
            body = (favicon_response.content or b'')[:400].decode('utf-8', errors='replace')
            raise CommandError(
                f"Runtime smoke test failed for '/favicon.ico': status={favicon_response.status_code}, body={body!r}"
            )

        self.stdout.write(self.style.SUCCESS('Runtime smoke test passed.'))
