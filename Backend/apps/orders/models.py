"""
apps/orders/models.py
"""

import uuid
from django.db import models
from apps.users.models import User
from apps.vendors.models import Vendor
from apps.products.models import Product


class Order(models.Model):
    class Status(models.TextChoices):
        PLACED = "placed", "Placed"
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready for Collection"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash"
        MOBILE_MONEY = "mobile_money", "Mobile Money"
        CARD = "card", "Card"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.PROTECT, related_name="orders")
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name="orders")

    # Amounts
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Payment
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    payment_status = models.CharField(
        max_length=15, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    flutter_ref = models.CharField(max_length=100, blank=True, db_index=True)
    payment_link = models.URLField(blank=True)

    # Fulfilment
    order_status = models.CharField(max_length=15, choices=Status.choices, default=Status.PLACED)
    notes = models.TextField(blank=True, help_text="Special instructions from the student")

    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "order_status"]),
            models.Index(fields=["vendor", "order_status"]),
            models.Index(fields=["payment_status"]),
        ]

    def __str__(self):
        return f"Order {self.id} — {self.student.name} → {self.vendor.name}"

    def get_total_amount(self):
        return sum(item.subtotal for item in self.items.all())

    def update_totals(self):
        self.total_amount = self.get_total_amount()
        self.subtotal = self.total_amount
        self.save(update_fields=["total_amount", "subtotal"])


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="order_items")
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "order_items"

    def __str__(self):
        return f"{self.quantity}x {self.product.name} @ ZMW {self.unit_price}"

    def calculate_subtotal(self):
        return self.unit_price * self.quantity

    def save(self, *args, **kwargs):
        self.subtotal = self.calculate_subtotal()
        super().save(*args, **kwargs)
