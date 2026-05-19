"""
apps/vendors/views.py
"""

from django.utils.text import slugify
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from apps.users.models import User
from .models import Vendor, VendorRating
from .serializers import VendorSerializer, VendorRatingSerializer
from .permissions import IsVendorOwner, IsAdminUser


@extend_schema(tags=["vendors"])
class VendorListView(generics.ListAPIView):
    """List all active vendors. Publicly accessible."""

    serializer_class = VendorSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "status", "has_bookable_services"]
    search_fields = ["name", "description", "location_notes"]
    ordering_fields = ["name", "created_at"]

    def get_queryset(self):
        return Vendor.objects.filter(status=Vendor.Status.ACTIVE).prefetch_related("ratings")


@extend_schema(tags=["vendors"])
class VendorMeView(generics.RetrieveUpdateAPIView):
    """Get or update the authenticated vendor's own profile."""

    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return Vendor.objects.get(owner=self.request.user)
        except Vendor.DoesNotExist:
            raise NotFound("Your vendor profile does not exist. Please register as a vendor first.")


@extend_schema(tags=["vendors"])
class VendorDetailView(generics.RetrieveAPIView):
    """Retrieve a single vendor by slug."""

    serializer_class = VendorSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Vendor.objects.prefetch_related("ratings")
    lookup_field = "slug"


@extend_schema(tags=["vendors"])
class VendorCreateView(generics.CreateAPIView):
    """Admin-only: create a new vendor record."""

    serializer_class = VendorSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        name = serializer.validated_data["name"]
        serializer.save(slug=slugify(name), status=Vendor.Status.ACTIVE)


@extend_schema(tags=["vendors"])
class VendorUpdateView(generics.UpdateAPIView):
    """Vendor owners or admins can update vendor details."""

    serializer_class = VendorSerializer
    permission_classes = [IsVendorOwner | IsAdminUser]
    queryset = Vendor.objects.all()
    lookup_field = "slug"


@extend_schema(tags=["vendors"])
class VendorSuspendView(APIView):
    """Admin-only: suspend or reinstate a vendor."""

    permission_classes = [IsAdminUser]

    def post(self, request, slug):
        vendor = generics.get_object_or_404(Vendor, slug=slug)
        action = request.data.get("action")  # "suspend" or "reinstate"
        if action == "suspend":
            vendor.status = Vendor.Status.SUSPENDED
        elif action == "reinstate":
            vendor.status = Vendor.Status.ACTIVE
        else:
            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
        vendor.save(update_fields=["status"])
        return Response(VendorSerializer(vendor).data)


@extend_schema(tags=["vendors"])
class VendorRatingCreateView(generics.CreateAPIView):
    """Students can rate a vendor after completing an order."""

    serializer_class = VendorRatingSerializer

    def perform_create(self, serializer):
        vendor = generics.get_object_or_404(Vendor, slug=self.kwargs["slug"])
        serializer.save(vendor=vendor, student=self.request.user)


@extend_schema(tags=["vendors"])
class VendorRatingListView(generics.ListAPIView):
    """List all ratings for a vendor."""

    serializer_class = VendorRatingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return VendorRating.objects.filter(
            vendor__slug=self.kwargs["slug"]
        ).select_related("student")
