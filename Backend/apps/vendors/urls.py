from django.urls import path
from . import views

app_name = "vendors"

urlpatterns = [
    path("", views.VendorListView.as_view(), name="list"),
    path("create/", views.VendorCreateView.as_view(), name="create"),
    path("me/", views.VendorMeView.as_view(), name="me"),
    path("<slug:slug>/", views.VendorDetailView.as_view(), name="detail"),
    path("<slug:slug>/update/", views.VendorUpdateView.as_view(), name="update"),
    path("<slug:slug>/suspend/", views.VendorSuspendView.as_view(), name="suspend"),
    path("<slug:slug>/ratings/", views.VendorRatingListView.as_view(), name="ratings-list"),
    path("<slug:slug>/ratings/add/", views.VendorRatingCreateView.as_view(), name="ratings-create"),
]
