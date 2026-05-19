"""
apps/notifications/models.py
"""

import uuid
from django.db import models
from apps.users.models import User


class Notification(models.Model):
    class Type(models.TextChoices):
        ORDER = "order", "Order"
        PAYMENT = "payment", "Payment"
        BOOKING = "booking", "Booking"
        PROMO = "promo", "Promotion"
        SYSTEM = "system", "System"

    class RecipientType(models.TextChoices):
        STUDENT = "student", "Student"
        VENDOR = "vendor", "Vendor"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    recipient_type = models.CharField(max_length=10, choices=RecipientType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=10, choices=Type.choices)
    is_read = models.BooleanField(default=False)
    metadata = models.JSONField(null=True, blank=True, help_text="e.g. order_id, booking_id")
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-sent_at"]

    def __str__(self):
        return f"[{self.type}] {self.title} → {self.recipient.name}"
