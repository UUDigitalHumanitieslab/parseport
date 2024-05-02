from django.apps import AppConfig
from django.core import checks

from .views import load_dataset

class AethelDbConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "aethel_db"


@checks.register()
def check_aethel_dataset(app_configs, **kwargs):
    try:
        load_dataset()
        return []
    except FileNotFoundError:
        return [
            checks.Error(f"Æthel dataset not found.")
        ]
