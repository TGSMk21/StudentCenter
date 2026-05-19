"""
apps/orders/serializers.py
"""

from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "product_image", "quantity", "unit_price", "subtotal"]
        read_only_fields = ["id", "unit_price", "subtotal"]


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    vendor_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    items = OrderItemCreateSerializer(many=True, min_length=1)
    notes = serializers.CharField(required=False, allow_blank=True)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source="student.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    vendor_slug = serializers.CharField(source="vendor.slug", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "student_name", "vendor_name", "vendor_slug",
            "subtotal", "total_amount", "payment_method", "payment_status",
            "flutter_ref", "payment_link", "order_status", "notes", "items",
            "created_at", "updated_at",
        ]


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["order_status"]
