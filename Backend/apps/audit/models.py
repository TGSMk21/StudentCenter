"""
apps/audit/models.py
Immutable audit log for vendor actions.
"""

import uuid
from django.db import models
from apps.vendors.models import Vendor


class AuditLog(models.Model):
    class Action(models.TextChoices):
        ORDER_COMPLETED = "order_completed", "Order Completed"
        STOCK_UPDATED = "stock_updated", "Stock Updated"
        PRODUCT_CREATED = "product_created", "Product Created"
        PRODUCT_UPDATED = "product_updated", "Product Updated"
        PRODUCT_DELETED = "product_deleted", "Product Deleted"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="audit_logs")
    action = models.CharField(max_length=30, choices=Action.choices)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vendor", "-created_at"]),
        ]
        # Enforce immutability — no update allowed
        permissions = [
            ("cannot_update_auditlog", "Cannot update audit log entries"),
        ]

    def __str__(self):
        return f"[{self.created_at}] {self.vendor.name} — {self.action}"

    def save(self, *args, **kwargs):
        if self._state.adding:
            super().save(*args, **kwargs)
        else:
            raise PermissionError("Audit log entries are immutable and cannot be updated.")

    @classmethod
    def log(cls, vendor, action, description, metadata=None):
        return cls.objects.create(
            vendor=vendor,
            action=action,
            description=description,
            metadata=metadata or {},
        )
