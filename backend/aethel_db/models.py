from typing import Optional

from django.conf import settings

from aethel import ProofBank

dataset: Optional[ProofBank] = None


def load_dataset():
    global dataset
    dataset = ProofBank.load_data(settings.DATASET_PATH)
