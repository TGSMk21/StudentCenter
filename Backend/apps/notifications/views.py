"""
apps/notifications/views.py
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .models import Notification
from .serializers import NotificationSerializer


@extend_schema(tags=["notifications"])
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


@extend_schema(tags=["notifications"])
class MarkReadView(APIView):
    def post(self, request, pk=None):
        qs = Notification.objects.filter(recipient=request.user)
        if pk:
            qs = qs.filter(pk=pk)
        qs.update(is_read=True)
        return Response({"message": "Marked as read."})


@extend_schema(tags=["notifications"])
class BroadcastPromoView(APIView):
    """Admin-only: broadcast a promo push to all students."""

    def post(self, request):
        if not request.user.is_admin_user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        from .tasks import broadcast_promo
        title = request.data.get("title", "")
        message = request.data.get("message", "")
        if not title or not message:
            return Response({"error": "title and message are required."}, status=400)
        broadcast_promo.delay(title, message)
        return Response({"message": "Broadcast queued."})
