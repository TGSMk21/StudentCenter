"""
apps/notifications/serializers.py
"""

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "type", "is_read", "metadata", "sent_at"]
        read_only_fields = fields
