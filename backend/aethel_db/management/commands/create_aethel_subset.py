import pickle
from django.conf import settings
from django.core.management.base import BaseCommand, CommandParser

from parseport.logger import logger

FULL_DATASET_PATH = getattr(settings, "FULL_DATASET_PATH")
DATA_SUBSET_PATH = getattr(settings, "DATA_SUBSET_PATH")

class Command(BaseCommand):
    help = "Creates a subset of the Aethel dataset and outputs it to a new pickle file. Retrieves the passed number of records (default = 50) from each of the three subsets included: 'train', 'dev', and 'test'."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "--number-of-records",
            "-n",
            dest="number-of-records",
            type=int,
            default=50,
            help="The number of records to include in the subset",
        )
        super().add_arguments(parser)

    def handle(self, *args, **options):
        """
        The Aethel dataset (v. 1.0.0a5) currently has 68763 samples, spread over three subsets.
        - 5770 in 'test';
        - 6118 in 'dev';
        - 56875 in 'train';
        """

        subset_size = options["number-of-records"]

        logger.info(f"Creating a subset of the Aethel dataset with size {subset_size}...")
        with open(FULL_DATASET_PATH, "rb") as f:
            version, (train, dev, test) = pickle.load(f)
            logger.info("Full pickle loaded!")

        train_length = len(train)
        dev_length = len(dev)
        test_length = len(test)

        min_length = min([train_length, dev_length, test_length])

        # Ensure the subset size does not exceed the smallest subset's length.
        clamped = min(subset_size, min_length)

        logger.info('Clamped dataset size:', clamped)

        new_train = train[:clamped]
        new_test = test[:clamped]
        new_dev = dev[:clamped]

        logger.info("Writing smaller dataset to new pickle file...")
        with open(DATA_SUBSET_PATH, "wb") as f:
            pickle_contents = version, (new_train, new_dev, new_test)
            pickle.dump(pickle_contents, f)

        logger.info("Done!")
