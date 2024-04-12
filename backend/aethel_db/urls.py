from django.urls import path
from aethel_db.views import AethelQueryView, AethelDetailView

urlpatterns = [
    path("", AethelQueryView.as_view(), name="aethel-list"),
    path("<int:pk>", AethelDetailView.as_view(), name="aethel-detail"),
]
