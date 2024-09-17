from climbing_app_backend.models import AppUser
from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend):
    # This is the backend authentication class that authenticates based on email instead
    # username
    # This is so the user can sign in with email or username
    def authenticate(self, username=None, password=None, **kwargs):
        try:
            user = AppUser.objects.get(email=username)
        except AppUser.DoesNotExist:
            return None
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
            
        return None