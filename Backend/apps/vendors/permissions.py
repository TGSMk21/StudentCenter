"""
apps/vendors/permissions.py
"""

from rest_framework.permissions import BasePermission


class IsVendorOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user
