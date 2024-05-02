import logging
import os
from django.conf import settings
from django.apps import AppConfig

from .models import load_dataset

log = logging.getLogger()


class AethelDbConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "aethel_db"

    def ready(self):
        if os.path.exists(settings.DATASET_PATH):
            load_dataset()
        else:
            log.critical("Æthel dataset not found.")
