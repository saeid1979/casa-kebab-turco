
from rest_framework.permissions import BasePermission


def get_user_role(user):
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser or user.is_staff:
        return 'admin'
    profile = getattr(user, 'profile', None)
    return getattr(profile, 'role', None)


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == 'admin'


class IsRestaurantStaffRole(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) in ['admin', 'cashier', 'kitchen', 'delivery']
