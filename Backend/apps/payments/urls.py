from django.urls import path
from . import views

app_name = "payments"

urlpatterns = [
    path("initiate/<uuid:order_id>/", views.InitiatePaymentView.as_view(), name="initiate"),
    path("webhook/flutterwave/", views.FlutterwaveWebhookView.as_view(), name="flutterwave-webhook"),
    path("detail/<uuid:order_id>/", views.PaymentDetailView.as_view(), name="detail"),
]
