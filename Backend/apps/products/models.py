"""
apps/products/models.py
"""

import uuid
from django.db import models
from apps.vendors.models import Vendor


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Material icon name")

    class Meta:
        db_table = "product_categories"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="products")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price in ZMW")
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_service = models.BooleanField(default=False, help_text="True for bookable services")
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vendor", "is_available"]),
            models.Index(fields=["category"]),
        ]

    def __str__(self):
        return f"{self.name} — {self.vendor.name} (ZMW {self.price})"

    @property
    def effective_price(self):
        return self.discount_price if self.discount_price else self.price

    def check_stock(self):
        return self.stock > 0

    def decrement_stock(self, qty: int):
        if self.stock < qty:
            raise ValueError(f"Insufficient stock for {self.name}.")
        self.stock -= qty
        self.save(update_fields=["stock"])

    def apply_discount(self, percentage: float):
        self.discount_price = self.price * (1 - percentage / 100)
        self.save(update_fields=["discount_price"])
