"""
apps/bookings/views.py
"""

import random
import string
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer


@extend_schema(tags=["bookings"])
class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer

    def perform_create(self, serializer):
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        booking = serializer.save(student=self.request.user, confirmation_code=code)
        # Async notification
        from apps.notifications.tasks import send_booking_confirmation
        send_booking_confirmation.delay(str(booking.id))


@extend_schema(tags=["bookings"])
class StudentBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(student=self.request.user).select_related("vendor", "service")


@extend_schema(tags=["bookings"])
class VendorBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(vendor__owner=self.request.user).select_related("student", "service")


@extend_schema(tags=["bookings"])
class BookingStatusUpdateView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        return Booking.objects.filter(vendor__owner=self.request.user)

    def get_serializer(self, *args, **kwargs):
        kwargs["fields"] = ["status"]
        return super().get_serializer(*args, **kwargs)


@extend_schema(tags=["bookings"])
class AvailabilityView(APIView):
    """Check booked time slots for a vendor on a given date."""

    def get(self, request, vendor_id):
        date = request.query_params.get("date")
        if not date:
            return Response({"error": "?date=YYYY-MM-DD is required."}, status=400)
        booked = Booking.check_availability(vendor_id=vendor_id, date=date)
        return Response({"booked_slots": list(booked)})
