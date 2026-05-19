"""
apps/disputes/models.py
"""

import uuid
from django.db import models
from apps.users.models import User
from apps.orders.models import Order


class Dispute(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        UNDER_REVIEW = "under_review", "Under Review"
        RESOLVED = "resolved", "Resolved"
        DISMISSED = "dismissed", "Dismissed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="disputes")
    raised_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="disputes_raised")
    description = models.TextField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="disputes_resolved"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "disputes"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Dispute {self.id} — {self.status} — Order {self.order_id}"
