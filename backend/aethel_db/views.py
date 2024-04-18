from dataclasses import asdict, dataclass, field
from typing import List, Optional
from django.http import HttpRequest, JsonResponse
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from aethel import ProofBank
from aethel.frontend import Sample, LexicalItem
from aethel_db.filters import in_lemma, in_word
from parseport.logger import logger
from src.aethel.scripts.search import search

FULL_DATASET_PATH = getattr(settings, "FULL_DATASET_PATH")
DATA_SUBSET_PATH = getattr(settings, "DATA_SUBSET_PATH")

if getattr(settings, "DEBUG", False) is False:
    dataset = ProofBank.load_data(FULL_DATASET_PATH)
else:
    try:
        dataset = ProofBank.load_data(DATA_SUBSET_PATH)
    except FileNotFoundError:
        logger.error(
            "Aethel subset not found. Have you run create_aethel_subset? Using full dataset instead."
        )
        dataset = ProofBank.load_data(FULL_DATASET_PATH)


@dataclass
class AethelSample:
    name: str
    sentence: str


@dataclass
class AethelListItem:
    lemma: str
    word: str
    type: str
    samples: List[AethelSample] = field(default_factory=list)


@dataclass
class AethelListResponse:
    """
    Response object for Aethel query view.
    """

    results: List[AethelListItem] = field(default_factory=list)
    error: Optional[str] = None

    def existing_result(
        self, lemma: str, word: str, type: str
    ) -> Optional[AethelListItem]:
        """
        Return an existing result with the same lemma, word, and type, if it exists.
        """
        for item in self.results:
            if item.lemma == lemma and item.type == type and item.word == word:
                return item
        return None

    def add_result(self, lemma: str, word: str, type: str, sample: Sample) -> None:
        result_item = self.existing_result(lemma, word, type)

        if result_item is None:
            result_item = AethelListItem(lemma=lemma, word=word, type=type)
            self.results.append(result_item)

        result_item.samples.append(
            AethelSample(name=sample.name, sentence=sample.sentence)
        )

    def json_response(self) -> JsonResponse:
        results = [asdict(result) for result in self.results]

        return JsonResponse(
            {
                "results": results,
                "error": self.error,
            },
            status=status.HTTP_200_OK,
        )


class AethelQueryView(APIView):
    def get(self, request: HttpRequest):
        query_input = self.request.query_params.get("query", None)
        if query_input is None:
            return AethelListResponse().json_response()

        # Filter samples based on query
        query_result = search(
            bank=dataset.samples,
            query=in_word(query_input.lower()) | in_lemma(query_input.lower()),
        )

        def item_contains_query_string(item: LexicalItem) -> bool:
            return (
                query_input.lower() in item.lemma.lower()
                or query_input.lower() in item.word.lower()
            )

        collected_results = AethelListResponse()
        for sample in query_result:
            lexical_phrases = sample.lexical_phrases
            for phrase in lexical_phrases:
                for item in phrase.items:
                    if item_contains_query_string(item):
                        collected_results.add_result(
                            item.lemma, item.word, str(phrase.type), sample
                        )

        return collected_results.json_response()


class AethelDetailView(APIView):
    def get(self, request: HttpRequest, pk: int):
        return Response("Success!", status=status.HTTP_200_OK)
