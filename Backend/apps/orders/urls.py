from django.urls import path
from . import views

app_name = "orders"

urlpatterns = [
    path("", views.StudentOrderListView.as_view(), name="student-list"),
    path("create/", views.OrderCreateView.as_view(), name="create"),
    path("vendor/", views.VendorOrderListView.as_view(), name="vendor-list"),
    path("admin/", views.AdminOrderListView.as_view(), name="admin-list"),
    path("<uuid:pk>/", views.OrderDetailView.as_view(), name="detail"),
    path("<uuid:pk>/status/", views.OrderStatusUpdateView.as_view(), name="status-update"),
]
