"""
apps/notifications/tasks.py
Celery async tasks for push notifications via FCM
"""

import logging
from celery import shared_task

logger = logging.getLogger(__name__)


def _create_notification(recipient, recipient_type, title, message, notif_type, metadata=None):
    from .models import Notification
    return Notification.objects.create(
        recipient=recipient,
        recipient_type=recipient_type,
        title=title,
        message=message,
        type=notif_type,
        metadata=metadata or {},
    )


def _send_fcm(user, title, message, data=None):
    """Send Firebase Cloud Messaging push notification."""
    if not user.fcm_token:
        return
    try:
        from fcm_django.models import FCMDevice
        device = FCMDevice(registration_id=user.fcm_token, cloud_message_type="FCM")
        device.send_message(title=title, body=message, data=data or {})
    except Exception as e:
        logger.warning(f"FCM send failed for user {user.id}: {e}")


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_order_status_notification(self, order_id: str):
    try:
        from apps.orders.models import Order
        order = Order.objects.select_related("student", "vendor").get(id=order_id)
        status_messages = {
            "processing": ("Order Being Prepared 🍽️", f"Your order from {order.vendor.name} is being prepared."),
            "ready": ("Ready for Collection ✅", f"Your order from {order.vendor.name} is ready! Come collect it."),
            "completed": ("Order Completed 🎉", f"Order from {order.vendor.name} is marked as completed."),
            "cancelled": ("Order Cancelled ❌", f"Your order from {order.vendor.name} was cancelled."),
        }
        title, message = status_messages.get(order.order_status, ("Order Update", "Your order status has changed."))
        _create_notification(order.student, "student", title, message, "order", {"order_id": order_id})
        _send_fcm(order.student, title, message, {"order_id": order_id})
    except Exception as e:
        logger.error(f"send_order_status_notification failed: {e}")
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_payment_success_notification(self, order_id: str):
    try:
        from apps.orders.models import Order
        order = Order.objects.select_related("student", "vendor").get(id=order_id)
        title = "Payment Confirmed ✅"
        student_msg = f"Your payment for order at {order.vendor.name} was successful. ZMW {order.total_amount}."
        vendor_msg = f"New order confirmed from {order.student.name}. ZMW {order.total_amount}."

        _create_notification(order.student, "student", title, student_msg, "payment", {"order_id": order_id})
        _send_fcm(order.student, title, student_msg)

        if order.vendor.owner:
            _create_notification(order.vendor.owner, "vendor", "New Order Received 🛍️", vendor_msg, "order", {"order_id": order_id})
            _send_fcm(order.vendor.owner, "New Order Received 🛍️", vendor_msg)
    except Exception as e:
        logger.error(f"send_payment_success_notification failed: {e}")
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_payment_failed_notification(self, order_id: str):
    try:
        from apps.orders.models import Order
        order = Order.objects.select_related("student").get(id=order_id)
        title = "Payment Failed ❌"
        msg = f"Your payment for an order at {order.vendor.name} failed. Please try again."
        _create_notification(order.student, "student", title, msg, "payment", {"order_id": order_id})
        _send_fcm(order.student, title, msg)
    except Exception as e:
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_booking_confirmation(self, booking_id: str):
    try:
        from apps.bookings.models import Booking
        booking = Booking.objects.select_related("student", "vendor", "service").get(id=booking_id)
        title = "Booking Confirmed 📅"
        msg = (
            f"Your booking for '{booking.service.name}' at {booking.vendor.name} "
            f"on {booking.slot_date} at {booking.slot_time.strftime('%H:%M')} is confirmed. "
            f"Ref: {booking.confirmation_code}"
        )
        _create_notification(booking.student, "student", title, msg, "booking", {"booking_id": booking_id})
        _send_fcm(booking.student, title, msg)
    except Exception as e:
        self.retry(exc=e)


@shared_task
def broadcast_promo(title: str, message: str):
    """Broadcast a promotional message to all active students."""
    from apps.users.models import User
    students = User.objects.filter(role=User.Role.STUDENT, is_active=True)
    for student in students:
        _create_notification(student, "student", title, message, "promo")
        _send_fcm(student, title, message)
    logger.info(f"Promo broadcast to {students.count()} students.")
