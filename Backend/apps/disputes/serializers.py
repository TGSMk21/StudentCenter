"""
apps/disputes/serializers.py
"""

from rest_framework import serializers
from .models import Dispute


class DisputeSerializer(serializers.ModelSerializer):
    raised_by_name = serializers.CharField(source="raised_by.name", read_only=True)
    resolved_by_name = serializers.CharField(source="resolved_by.name", read_only=True)
    order_ref = serializers.CharField(source="order.id", read_only=True)

    class Meta:
        model = Dispute
        fields = [
            "id", "order", "order_ref", "raised_by_name", "description",
            "status", "resolution_notes", "resolved_by_name", "created_at",
        ]
        read_only_fields = ["id", "raised_by_name", "resolved_by_name", "status", "resolution_notes", "created_at"]


class ResolveDisputeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = ["status", "resolution_notes"]
