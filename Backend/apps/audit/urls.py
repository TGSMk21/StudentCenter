from django.urls import path
from . import views

app_name = "audit"

urlpatterns = [
    path("", views.VendorAuditLogListView.as_view(), name="list"),
]
