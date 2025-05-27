from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Check if a user exists in the database'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user to check')

    def handle(self, *args, **options):
        email = options['email']
        try:
            user = User.objects.get(email=email)
            self.stdout.write(self.style.SUCCESS(f'User found: {user.email}'))
            self.stdout.write(f'Username: {user.username}')
            self.stdout.write(f'First name: {user.first_name}')
            self.stdout.write(f'Last name: {user.last_name}')
            self.stdout.write(f'Is active: {user.is_active}')
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'No user found with email: {email}')) 