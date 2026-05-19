from django.urls import path
from . import views

app_name = "bookings"

urlpatterns = [
    path("", views.StudentBookingListView.as_view(), name="student-list"),
    path("create/", views.BookingCreateView.as_view(), name="create"),
    path("vendor/", views.VendorBookingListView.as_view(), name="vendor-list"),
    path("<uuid:pk>/status/", views.BookingStatusUpdateView.as_view(), name="status-update"),
    path("availability/<uuid:vendor_id>/", views.AvailabilityView.as_view(), name="availability"),
]
