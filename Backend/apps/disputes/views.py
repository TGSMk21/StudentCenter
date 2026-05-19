"""
apps/disputes/views.py
"""

from rest_framework import generics, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import Dispute
from .serializers import DisputeSerializer, ResolveDisputeSerializer


@extend_schema(tags=["disputes"])
class DisputeCreateView(generics.CreateAPIView):
    serializer_class = DisputeSerializer

    def perform_create(self, serializer):
        serializer.save(raised_by=self.request.user)


@extend_schema(tags=["disputes"])
class StudentDisputeListView(generics.ListAPIView):
    serializer_class = DisputeSerializer

    def get_queryset(self):
        return Dispute.objects.filter(raised_by=self.request.user)


@extend_schema(tags=["disputes"])
class AdminDisputeListView(generics.ListAPIView):
    serializer_class = DisputeSerializer

    def get_queryset(self):
        if not self.request.user.is_admin_user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        return Dispute.objects.all().select_related("raised_by", "order")


@extend_schema(tags=["disputes"])
class ResolveDisputeView(generics.UpdateAPIView):
    serializer_class = ResolveDisputeSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        if not self.request.user.is_admin_user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        return Dispute.objects.all()

    def perform_update(self, serializer):
        serializer.save(resolved_by=self.request.user)
