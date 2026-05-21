"""
apps/bookings/serializers.py
"""

from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)
    service_price = serializers.DecimalField(source="service.effective_price", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "student_name", "vendor_name", "service", "service_name", "service_price",
            "slot_date", "slot_time", "status", "notes", "confirmation_code", "created_at",
        ]
        read_only_fields = ["id", "student_name", "vendor_name", "service_name", "confirmation_code", "created_at"]


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["vendor", "service", "slot_date", "slot_time", "notes"]

    def validate(self, attrs):
        vendor = attrs["vendor"]
        date = attrs["slot_date"]
        time = attrs["slot_time"]
        if Booking.objects.filter(vendor=vendor, slot_date=date, slot_time=time).exclude(status=Booking.Status.CANCELLED).exists():
            raise serializers.ValidationError("This time slot is already booked.")
        return attrs


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["status"]
