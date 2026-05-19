"""
apps/products/serializers.py
"""

from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon"]


class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    vendor_slug = serializers.CharField(source="vendor.slug", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    effective_price = serializers.ReadOnlyField()
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "vendor", "vendor_name", "vendor_slug",
            "category", "category_name",
            "name", "description", "price", "discount_price", "effective_price",
            "stock", "in_stock", "is_service", "is_available", "image",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "vendor", "vendor_name", "vendor_slug", "created_at", "updated_at"]

    def get_in_stock(self, obj):
        return obj.stock > 0


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id", "vendor",
            "name", "description", "price", "discount_price",
            "stock", "is_service", "is_available", "image", "category",
        ]
        read_only_fields = ["id", "vendor"]
