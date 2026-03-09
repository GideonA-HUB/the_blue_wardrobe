import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Creates or updates a Django superuser from environment variables.'

    def handle(self, *args, **options):
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', '').strip()
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', '').strip()
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', '').strip()

        if not username and not password and not email:
            self.stdout.write('Skipping superuser bootstrap: DJANGO_SUPERUSER_USERNAME is not set.')
            return

        if not username:
            raise CommandError('DJANGO_SUPERUSER_USERNAME must be set when bootstrapping a superuser.')

        if not password:
            raise CommandError('DJANGO_SUPERUSER_PASSWORD must be set when bootstrapping a superuser.')

        user_model = get_user_model()
        lookup = {user_model.USERNAME_FIELD: username}
        user, created = user_model._default_manager.get_or_create(**lookup)

        if email and hasattr(user, 'email'):
            user.email = email

        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created superuser '{username}'."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Updated superuser '{username}'."))
