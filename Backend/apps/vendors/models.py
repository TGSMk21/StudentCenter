"""
apps/vendors/models.py
"""

import uuid
from django.db import models
from apps.users.models import User


class Vendor(models.Model):
    class Category(models.TextChoices):
        MINIMART = "minimart", "Minimart"
        SALON = "salon", "Hair Salon"
        GENERAL_DEALERS = "general_dealers", "General Dealers"
        TECH_STORE = "tech_store", "Tech Store"
        PHARMACY = "pharmacy", "Pharmacy"
        BUTCHERY = "butchery", "Butchery"
        FAST_FOOD = "fast_food", "Fast Food Restaurant"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        PENDING = "pending", "Pending Approval"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="vendor_profile", null=True, blank=True
    )
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)
    category = models.CharField(max_length=30, choices=Category.choices)
    description = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    logo = models.ImageField(upload_to="vendor_logos/", null=True, blank=True)
    banner = models.ImageField(upload_to="vendor_banners/", null=True, blank=True)
    location_notes = models.CharField(max_length=255, blank=True, help_text="e.g. Block A, Ground Floor")
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    has_bookable_services = models.BooleanField(default=False)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    operating_days = models.JSONField(
        default=list,
        help_text='List of day names, e.g. ["Monday","Tuesday","Wednesday","Thursday","Friday"]',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "vendors"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class VendorRating(models.Model):
    """Student ratings and reviews for vendors."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="ratings")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ratings_given")
    score = models.PositiveSmallIntegerField()  # 1–5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vendor_ratings"
        unique_together = ("vendor", "student")

    def __str__(self):
        return f"{self.vendor.name} — {self.score}★ by {self.student.name}"
