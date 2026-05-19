from django.urls import path
from . import views

app_name = "products"

urlpatterns = [
    path("", views.ProductListView.as_view(), name="list"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("create/", views.ProductCreateView.as_view(), name="create"),
    path("<uuid:pk>/", views.ProductDetailView.as_view(), name="detail"),
    path("<uuid:pk>/update/", views.ProductUpdateView.as_view(), name="update"),
    path("<uuid:pk>/delete/", views.ProductDeleteView.as_view(), name="delete"),
    path("vendor/<slug:slug>/", views.VendorProductListView.as_view(), name="vendor-products"),
]
