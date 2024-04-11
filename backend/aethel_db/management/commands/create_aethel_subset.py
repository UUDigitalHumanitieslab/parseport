import pickle
from django.conf import settings
from django.core.management.base import BaseCommand, CommandParser
from aethel.frontend import ProofBank, Sample


class Command(BaseCommand):
    help = "Creates a subset of the Aethel dataset and outputs it to a new pickle file. Retrieves the passed number of records (default = 200) from each of the three subsets included: 'train', 'dev', and 'test'."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "--number-of-records",
            "-n",
            dest="number-of-records",
            type=int,
            default=200,
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

        print(f"Creating a subset of the Aethel dataset with size {subset_size}...")
        with open("./src/aethel/data/aethel_1.0.0a5.pickle", "rb") as f:
            version, (train, dev, test) = pickle.load(f)
            print("Full pickle loaded!")

        train_length = len(train)
        dev_length = len(dev)
        test_length = len(test)

        min_length = min([train_length, dev_length, test_length])

        # Ensure the subset size does not exceed the smallest subset's length.
        clamped = min(subset_size, min_length)

        print('Clamped dataset size:', clamped)

        new_train = train[:clamped]
        new_test = test[:clamped]
        new_dev = dev[:clamped]

        print("Writing smaller dataset to new pickle file...")
        with open("./aethel_db/data/aethel_subset.pickle", "wb") as f:
            pickle_contents = version, (new_train, new_dev, new_test)
            pickle.dump(pickle_contents, f)

        print("Done!")