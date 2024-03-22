from django.urls import path
from backend.aethel_db.views import AethelListView, AethelDetailView

urlpatterns = [
    path("", AethelListView.as_view(), name="aethel-list"),
    path("/<int:pk>", AethelDetailView.as_view(), name="aethel-detail"),
]
