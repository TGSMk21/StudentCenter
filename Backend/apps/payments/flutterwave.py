"""
apps/payments/flutterwave.py
Flutterwave Sandbox Integration Service
"""

import hashlib
import hmac
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

FW_CONFIG = settings.FLUTTERWAVE


class FlutterwaveService:
    """
    Wraps Flutterwave REST API v3 for the Student Center Hub.
    All amounts are in ZMW (Zambian Kwacha).
    """

    BASE_URL = FW_CONFIG["BASE_URL"]
    SECRET_KEY = FW_CONFIG["SECRET_KEY"]
    CURRENCY = FW_CONFIG["CURRENCY"]

    def _headers(self):
        return {
            "Authorization": f"Bearer {self.SECRET_KEY}",
            "Content-Type": "application/json",
        }

    def initiate_payment(self, order, customer) -> dict:
        """
        Create a Flutterwave hosted payment link.
        Returns dict with `payment_link` and `tx_ref`.
        """
        tx_ref = f"SCH-{order.id}"
        payload = {
            "tx_ref": tx_ref,
            "amount": str(order.total_amount),
            "currency": self.CURRENCY,
            "redirect_url": FW_CONFIG["REDIRECT_URL"],
            "customer": {
                "email": customer.email,
                "phonenumber": customer.phone,
                "name": customer.name,
            },
            "customizations": {
                "title": "Student Center Hub",
                "description": f"Order from {order.vendor.name}",
                "logo": "https://mu.ac.zm/logo.png",
            },
            "meta": {
                "order_id": str(order.id),
                "vendor": order.vendor.name,
            },
        }
        try:
            response = requests.post(
                f"{self.BASE_URL}/payments",
                json=payload,
                headers=self._headers(),
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()
            return {
                "payment_link": data["data"]["link"],
                "tx_ref": tx_ref,
                "status": "success",
            }
        except requests.RequestException as e:
            logger.error(f"Flutterwave initiation error: {e}")
            return {"status": "error", "message": str(e)}

    def verify_transaction(self, tx_id: str) -> dict:
        """
        Verify a transaction by its Flutterwave transaction ID.
        Used as a secondary check after receiving a webhook.
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/transactions/{tx_id}/verify",
                headers=self._headers(),
                timeout=10,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Flutterwave verify error: {e}")
            return {}

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """
        HMAC-SHA256 signature verification for incoming webhooks.
        Prevents spoofed webhook events.
        """
        secret = FW_CONFIG["WEBHOOK_SECRET"].encode("utf-8")
        computed = hmac.new(secret, payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(computed, signature)


flutterwave = FlutterwaveService()
