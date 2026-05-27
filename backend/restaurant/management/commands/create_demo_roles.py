
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from restaurant.models import UserProfile


class Command(BaseCommand):
    help = 'Create demo users for restaurant roles'

    def handle(self, *args, **options):
        users = [
            ('admin_demo', 'admin12345', 'admin', True),
            ('cashier_demo', 'cashier12345', 'cashier', False),
            ('kitchen_demo', 'kitchen12345', 'kitchen', False),
            ('delivery_demo', 'delivery12345', 'delivery', False),
        ]

        for username, password, role, is_staff in users:
            user, created = User.objects.get_or_create(username=username)
            user.set_password(password)
            user.is_staff = is_staff
            user.save()

            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.role = role
            profile.save()

            self.stdout.write(self.style.SUCCESS(f'{username} / {password} / {role}'))
