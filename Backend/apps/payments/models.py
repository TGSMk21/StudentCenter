"""
apps/payments/models.py
"""

import uuid
from django.db import models
from apps.orders.models import Order


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = "cash", "Cash"
        MOBILE_MONEY = "mobile_money", "Mobile Money"
        CARD = "card", "Card"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    method = models.CharField(max_length=20, choices=Method.choices)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=5, default="ZMW")
    flutter_ref = models.CharField(max_length=100, blank=True, db_index=True)
    flutter_tx_id = models.CharField(max_length=100, blank=True)
    payment_link = models.URLField(blank=True)
    raw_webhook = models.JSONField(null=True, blank=True, help_text="Raw Flutterwave webhook payload")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment {self.id} — {self.status} — ZMW {self.amount}"

    def mark_success(self):
        self.status = self.Status.SUCCESS
        self.save(update_fields=["status", "updated_at"])
        self.order.payment_status = Order.PaymentStatus.SUCCESS
        self.order.save(update_fields=["payment_status"])

    def mark_failed(self):
        self.status = self.Status.FAILED
        self.save(update_fields=["status", "updated_at"])
        self.order.payment_status = Order.PaymentStatus.FAILED
        self.order.order_status = Order.Status.CANCELLED
        self.order.save(update_fields=["payment_status", "order_status"])
