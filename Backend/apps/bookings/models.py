"""
apps/bookings/models.py
"""

import uuid
from django.db import models
from apps.users.models import User
from apps.vendors.models import Vendor
from apps.products.models import Product


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="bookings")
    service = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="bookings",
        limit_choices_to={"is_service": True}
    )
    slot_date = models.DateField(db_index=True)
    slot_time = models.TimeField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    confirmation_code = models.CharField(max_length=12, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bookings"
        ordering = ["slot_date", "slot_time"]
        # Prevent double-booking: one booking per slot per vendor
        unique_together = ("vendor", "slot_date", "slot_time")

    def __str__(self):
        return f"{self.student.name} @ {self.vendor.name} — {self.slot_date} {self.slot_time}"

    @classmethod
    def check_availability(cls, vendor, date):
        return cls.objects.filter(
            vendor=vendor, slot_date=date
        ).exclude(status=cls.Status.CANCELLED).values_list("slot_time", flat=True)
