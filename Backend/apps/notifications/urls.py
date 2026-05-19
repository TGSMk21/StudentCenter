from django.urls import path
from . import views

app_name = "notifications"

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="list"),
    path("read/", views.MarkReadView.as_view(), name="mark-all-read"),
    path("<uuid:pk>/read/", views.MarkReadView.as_view(), name="mark-read"),
    path("broadcast/", views.BroadcastPromoView.as_view(), name="broadcast"),
]
