"""
Student Center Hub — Root URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

API_PREFIX = "api/v1/"

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # OpenAPI Schema & Docs
    path(f"{API_PREFIX}schema/", SpectacularAPIView.as_view(), name="schema"),
    path(f"{API_PREFIX}docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path(f"{API_PREFIX}redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # Application Routes
    path(f"{API_PREFIX}auth/", include("apps.users.urls", namespace="users")),
    path(f"{API_PREFIX}vendors/", include("apps.vendors.urls", namespace="vendors")),
    path(f"{API_PREFIX}products/", include("apps.products.urls", namespace="products")),
    path(f"{API_PREFIX}orders/", include("apps.orders.urls", namespace="orders")),
    path(f"{API_PREFIX}payments/", include("apps.payments.urls", namespace="payments")),
    path(f"{API_PREFIX}bookings/", include("apps.bookings.urls", namespace="bookings")),
    path(f"{API_PREFIX}notifications/", include("apps.notifications.urls", namespace="notifications")),
    path(f"{API_PREFIX}disputes/", include("apps.disputes.urls", namespace="disputes")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
