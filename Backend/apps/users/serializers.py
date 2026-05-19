"""
apps/users/serializers.py
"""

import random
import string
from datetime import timedelta

from django.utils import timezone
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from django.utils.text import slugify
from apps.vendors.models import Vendor
from .models import User, OTPVerification


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email", "name", "phone", "password", "password_confirm",
            "student_id", "program", "year_of_study",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class VendorRegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    shop_name = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(choices=Vendor.Category.choices)
    description = serializers.CharField(required=False, allow_blank=True)
    contact_email = serializers.EmailField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    location_notes = serializers.CharField(max_length=255, required=False, allow_blank=True)
    opening_time = serializers.TimeField(required=False, allow_null=True)
    closing_time = serializers.TimeField(required=False, allow_null=True)
    has_bookable_services = serializers.BooleanField(default=False)

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        vendor_fields = [
            "shop_name", "category", "description", "contact_email",
            "contact_phone", "location_notes", "opening_time",
            "closing_time", "has_bookable_services",
        ]
        vdata = {k: validated_data.pop(k) for k in vendor_fields if k in validated_data}
        vdata["name"] = vdata.pop("shop_name")
        with transaction.atomic():
            user = User.objects.create_user(role=User.Role.VENDOR, **validated_data)
            Vendor.objects.get_or_create(
                owner=user,
                defaults={
                    "slug": slugify(vdata["name"]) or f"vendor-{user.id.hex[:8]}",
                    **vdata,
                },
            )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    fcm_token = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        from django.contrib.auth import authenticate

        user = authenticate(email=attrs["email"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account is suspended.")

        if attrs.get("fcm_token"):
            user.fcm_token = attrs["fcm_token"]
            user.save(update_fields=["fcm_token"])

        refresh = RefreshToken.for_user(user)
        return {
            "user": UserProfileSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "name", "phone", "role",
            "student_id", "program", "year_of_study",
            "avatar", "is_verified", "created_at",
        ]
        read_only_fields = ["id", "email", "role", "is_verified", "created_at"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=OTPVerification.Purpose.choices)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No account found with this email.")
        return value

    def create_otp(self):
        email = self.validated_data["email"]
        purpose = self.validated_data["purpose"]
        user = User.objects.get(email=email)
        code = "".join(random.choices(string.digits, k=6))
        OTPVerification.objects.filter(user=user, purpose=purpose, is_used=False).update(is_used=True)
        return OTPVerification.objects.create(
            user=user,
            code=code,
            purpose=purpose,
            expires_at=timezone.now() + timedelta(minutes=10),
        )


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(choices=OTPVerification.Purpose.choices)

    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs["email"])
            otp = OTPVerification.objects.get(
                user=user,
                code=attrs["code"],
                purpose=attrs["purpose"],
                is_used=False,
            )
        except (User.DoesNotExist, OTPVerification.DoesNotExist):
            raise serializers.ValidationError("Invalid or expired OTP.")

        if not otp.is_valid():
            raise serializers.ValidationError("OTP has expired.")

        attrs["user"] = user
        attrs["otp"] = otp
        return attrs
