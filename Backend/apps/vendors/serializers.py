"""
apps/vendors/serializers.py
"""

from rest_framework import serializers
from .models import Vendor, VendorRating


class VendorSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            "id", "name", "slug", "category", "description",
            "contact_email", "contact_phone", "logo", "banner",
            "location_notes", "status", "has_bookable_services",
            "opening_time", "closing_time", "operating_days",
            "average_rating", "rating_count", "created_at",
        ]
        read_only_fields = ["id", "slug", "status", "created_at"]

    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if not ratings.exists():
            return None
        return round(sum(r.score for r in ratings) / ratings.count(), 1)

    def get_rating_count(self, obj):
        return obj.ratings.count()


class VendorRatingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)

    class Meta:
        model = VendorRating
        fields = ["id", "score", "comment", "student_name", "created_at"]
        read_only_fields = ["id", "student_name", "created_at"]

    def validate_score(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Score must be between 1 and 5.")
        return value
