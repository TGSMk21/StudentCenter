"""
apps/payments/views.py
"""

import json
import logging

from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from apps.orders.models import Order
from .models import Payment
from .serializers import PaymentSerializer, InitiatePaymentSerializer
from .flutterwave import flutterwave

logger = logging.getLogger(__name__)


@extend_schema(tags=["payments"])
class InitiatePaymentView(APIView):
    """
    Initiate an online payment for an order.
    Returns a Flutterwave hosted checkout URL.
    """

    def post(self, request, order_id):
        order = generics.get_object_or_404(
            Order, id=order_id, student=request.user, payment_status=Order.PaymentStatus.PENDING
        )

        if order.payment_method == Order.PaymentMethod.CASH:
            return Response({"error": "Cash orders do not require online payment."}, status=400)

        result = flutterwave.initiate_payment(order, request.user)
        if result["status"] == "error":
            return Response({"error": "Payment gateway unavailable. Try again later."}, status=502)

        # Create/update Payment record
        payment, _ = Payment.objects.update_or_create(
            order=order,
            defaults={
                "method": order.payment_method,
                "amount": order.total_amount,
                "flutter_ref": result["tx_ref"],
                "payment_link": result["payment_link"],
            },
        )
        order.flutter_ref = result["tx_ref"]
        order.payment_link = result["payment_link"]
        order.save(update_fields=["flutter_ref", "payment_link"])

        return Response({"payment_link": result["payment_link"], "tx_ref": result["tx_ref"]})


@extend_schema(tags=["payments"])
@method_decorator(csrf_exempt, name="dispatch")
class FlutterwaveWebhookView(APIView):
    """
    Receives Flutterwave webhook events.
    Validates HMAC signature before processing.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request):
        signature = request.headers.get("verif-hash", "")
        if not flutterwave.verify_webhook_signature(request.body, signature):
            logger.warning("Flutterwave webhook: invalid signature")
            return Response({"error": "Invalid signature."}, status=400)

        payload = json.loads(request.body)
        event = payload.get("event")
        data = payload.get("data", {})

        logger.info(f"Flutterwave webhook received: event={event}, ref={data.get('tx_ref')}")

        if event != "charge.completed":
            return Response({"message": "Event acknowledged."})

        tx_ref = data.get("tx_ref", "")
        fw_status = data.get("status", "")

        try:
            payment = Payment.objects.select_related("order").get(flutter_ref=tx_ref)
        except Payment.DoesNotExist:
            logger.error(f"Webhook: no payment found for tx_ref={tx_ref}")
            return Response({"error": "Payment not found."}, status=404)

        # Store raw webhook payload for audit
        payment.raw_webhook = payload
        payment.flutter_tx_id = str(data.get("id", ""))
        payment.save(update_fields=["raw_webhook", "flutter_tx_id"])

        if fw_status == "successful":
            # Secondary verification
            verified = flutterwave.verify_transaction(payment.flutter_tx_id)
            if verified.get("data", {}).get("status") == "successful":
                payment.mark_success()
                # Decrement stock for physical items
                for item in payment.order.items.all():
                    if not item.product.is_service:
                        item.product.decrement_stock(item.quantity)
                # Async notifications
                from apps.notifications.tasks import send_payment_success_notification
                send_payment_success_notification.delay(str(payment.order.id))
        else:
            payment.mark_failed()
            from apps.notifications.tasks import send_payment_failed_notification
            send_payment_failed_notification.delay(str(payment.order.id))

        return Response({"message": "Webhook processed."})


@extend_schema(tags=["payments"])
class PaymentDetailView(generics.RetrieveAPIView):
    """Retrieve payment details for a given order."""

    serializer_class = PaymentSerializer

    def get_object(self):
        order = generics.get_object_or_404(
            Order, id=self.kwargs["order_id"], student=self.request.user
        )
        return generics.get_object_or_404(Payment, order=order)
