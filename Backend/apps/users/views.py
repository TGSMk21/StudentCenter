"""
apps/users/views.py
"""

from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiExample

from .models import User
from .serializers import (
    RegisterSerializer,
    VendorRegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
)


@extend_schema(tags=["auth"])
class RegisterView(generics.CreateAPIView):
    """Register a new student account."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Account created successfully. Please sign in to continue."},
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["auth"])
class VendorRegisterView(generics.CreateAPIView):
    """Register a new vendor account with shop details."""

    serializer_class = VendorRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Vendor account created successfully. Please sign in to continue."},
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["auth"])
class LoginView(APIView):
    """Authenticate with email + password. Returns JWT tokens."""

    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


@extend_schema(tags=["auth"])
class LogoutView(APIView):
    """Blacklist the refresh token, effectively logging the user out."""

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["auth"])
class ProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user's profile."""

    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


@extend_schema(tags=["auth"])
class ChangePasswordView(APIView):
    """Change the authenticated user's password."""

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Password changed successfully."})


@extend_schema(tags=["auth"])
class RequestOTPView(APIView):
    """Send an OTP code to the user's email for verification or password reset."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.create_otp()

        # In production, send via email. For dev, return in response.
        from django.conf import settings
        response_data = {"message": f"OTP sent to {serializer.validated_data['email']}."}
        if settings.DEBUG:
            response_data["debug_otp"] = otp.code  # Remove in production!
        return Response(response_data)


@extend_schema(tags=["auth"])
class VerifyOTPView(APIView):
    """Verify an OTP code and mark the user's email as verified."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        otp = serializer.validated_data["otp"]

        otp.is_used = True
        otp.save(update_fields=["is_used"])

        if serializer.validated_data["purpose"] == "email_verify":
            user.is_verified = True
            user.email_verified_at = timezone.now()
            user.save(update_fields=["is_verified", "email_verified_at"])

        return Response({"message": "OTP verified successfully."})
