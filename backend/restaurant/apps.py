from django.apps import AppConfig
import os


class RestaurantConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "restaurant"

    def ready(self):
        if os.environ.get("CREATE_SUPERUSER", "False") != "True":
            return

        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()

            username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
            email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "s.javid79@gmail.com")
            password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "Javid135871")

            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
                print("Superuser created successfully.")
            else:
                print("Superuser already exists.")

        except Exception as e:
            print(f"Superuser creation skipped: {e}")