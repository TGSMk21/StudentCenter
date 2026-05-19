"""
apps/orders/views.py
"""

from django.db import transaction
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from apps.vendors.models import Vendor
from apps.products.models import Product
from .models import Order, OrderItem
from .serializers import (
    OrderCreateSerializer, OrderSerializer, OrderStatusUpdateSerializer
)


@extend_schema(tags=["orders"])
class OrderCreateView(APIView):
    """Place a new order. Validates stock and creates order atomically."""

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        vendor = generics.get_object_or_404(Vendor, id=data["vendor_id"], status=Vendor.Status.ACTIVE)

        # Validate all products belong to this vendor
        items_data = []
        for item in data["items"]:
            product = generics.get_object_or_404(
                Product, id=item["product_id"], vendor=vendor, is_available=True
            )
            if product.stock < item["quantity"] and not product.is_service:
                return Response(
                    {"error": f"Insufficient stock for '{product.name}'. Available: {product.stock}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            items_data.append({"product": product, "quantity": item["quantity"]})

        # Create Order
        order = Order.objects.create(
            student=request.user,
            vendor=vendor,
            payment_method=data["payment_method"],
            notes=data.get("notes", ""),
        )

        # Create OrderItems
        for item in items_data:
            product = item["product"]
            qty = item["quantity"]
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                unit_price=product.effective_price,
            )

        order.update_totals()

        # If cash, order is immediately confirmed. If online, payment service handles it.
        if order.payment_method == Order.PaymentMethod.CASH:
            order.payment_status = Order.PaymentStatus.PENDING
            order.save(update_fields=["payment_status"])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@extend_schema(tags=["orders"])
class StudentOrderListView(generics.ListAPIView):
    """List all orders for the authenticated student."""

    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects.filter(student=self.request.user)
            .prefetch_related("items__product")
            .select_related("vendor")
        )


@extend_schema(tags=["orders"])
class OrderDetailView(generics.RetrieveAPIView):
    """Retrieve a single order. Accessible by the student or vendor involved."""

    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user:
            return Order.objects.all()
        if user.is_vendor_user:
            return Order.objects.filter(vendor__owner=user)
        return Order.objects.filter(student=user)


@extend_schema(tags=["orders"])
class VendorOrderListView(generics.ListAPIView):
    """List all incoming orders for the authenticated vendor."""

    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects.filter(vendor__owner=self.request.user)
            .prefetch_related("items__product")
            .select_related("student")
        )


@extend_schema(tags=["orders"])
class OrderStatusUpdateView(generics.UpdateAPIView):
    """Vendors update the fulfilment status of an order."""

    serializer_class = OrderStatusUpdateSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        return Order.objects.filter(vendor__owner=self.request.user)

    def perform_update(self, serializer):
        order = serializer.save()
        # Trigger notification async
        from apps.notifications.tasks import send_order_status_notification
        send_order_status_notification.delay(str(order.id))


@extend_schema(tags=["orders"])
class AdminOrderListView(generics.ListAPIView):
    """Admin: view all orders across all vendors with filtering."""

    serializer_class = OrderSerializer

    def get_queryset(self):
        if not self.request.user.is_admin_user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        qs = Order.objects.all().select_related("student", "vendor").prefetch_related("items")
        vendor_id = self.request.query_params.get("vendor")
        order_status = self.request.query_params.get("status")
        payment_status = self.request.query_params.get("payment_status")
        if vendor_id:
            qs = qs.filter(vendor_id=vendor_id)
        if order_status:
            qs = qs.filter(order_status=order_status)
        if payment_status:
            qs = qs.filter(payment_status=payment_status)
        return qs
