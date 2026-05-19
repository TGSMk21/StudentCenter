"""
apps/products/views.py
"""

from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from apps.vendors.models import Vendor
from apps.vendors.permissions import IsVendorOwner, IsAdminUser
from .models import Product, Category
from .serializers import ProductSerializer, ProductCreateUpdateSerializer, CategorySerializer


@extend_schema(tags=["products"])
class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset = Category.objects.all()


@extend_schema(tags=["products"])
class ProductListView(generics.ListAPIView):
    """Browse all available products with search and filtering."""

    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["vendor", "category", "is_available", "is_service"]
    search_fields = ["name", "description", "vendor__name"]
    ordering_fields = ["price", "name", "created_at"]

    def get_queryset(self):
        return (
            Product.objects.filter(is_available=True)
            .select_related("vendor", "category")
        )


@extend_schema(tags=["products"])
class VendorProductListView(generics.ListAPIView):
    """List all products belonging to a specific vendor."""

    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            vendor__slug=self.kwargs["slug"], is_available=True
        ).select_related("vendor", "category")


@extend_schema(tags=["products"])
class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Product.objects.select_related("vendor", "category")


@extend_schema(tags=["products"])
class ProductCreateView(generics.CreateAPIView):
    """Vendor owner creates a new product."""

    serializer_class = ProductCreateUpdateSerializer

    def create(self, request, *args, **kwargs):
        if request.user.role != "vendor":
            return Response(
                {"detail": "Only vendor accounts can create products. Please register as a vendor first."},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            vendor = Vendor.objects.get(owner=request.user)
        except Vendor.DoesNotExist:
            return Response(
                {"detail": "Your vendor profile is missing. Please contact support or re-register as a vendor."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(vendor=vendor)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


@extend_schema(tags=["products"])
class ProductUpdateView(generics.UpdateAPIView):
    """Vendor owner updates their product."""

    serializer_class = ProductCreateUpdateSerializer
    queryset = Product.objects.all()

    def get_queryset(self):
        return Product.objects.filter(vendor__owner=self.request.user)


@extend_schema(tags=["products"])
class ProductDeleteView(generics.DestroyAPIView):
    """Vendor owner removes a product."""

    def get_queryset(self):
        return Product.objects.filter(vendor__owner=self.request.user)
