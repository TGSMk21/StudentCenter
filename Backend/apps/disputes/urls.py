from django.urls import path
from . import views

app_name = "disputes"

urlpatterns = [
    path("", views.StudentDisputeListView.as_view(), name="student-list"),
    path("create/", views.DisputeCreateView.as_view(), name="create"),
    path("admin/", views.AdminDisputeListView.as_view(), name="admin-list"),
    path("<uuid:pk>/resolve/", views.ResolveDisputeView.as_view(), name="resolve"),
]
