"""
apps/audit/views.py
"""

from rest_framework import generics
from drf_spectacular.utils import extend_schema

from .models import AuditLog
from .serializers import AuditLogSerializer


@extend_schema(tags=["audit"])
class VendorAuditLogListView(generics.ListAPIView):
    """List all audit log entries for the authenticated vendor."""

    serializer_class = AuditLogSerializer

    def get_queryset(self):
        return AuditLog.objects.filter(vendor__owner=self.request.user).select_related("vendor")
