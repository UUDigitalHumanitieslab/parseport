from dataclasses import asdict, dataclass, field
from typing import List, Optional

from django.http import HttpRequest, JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from aethel.frontend import LexicalItem

from .models import dataset
from .search import search, in_lemma, in_word




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

    def add_result(
        self, lemma: str, word: str, type: str, sample_name: str, sample_sentence: str
    ) -> None:
        result_item = self.existing_result(lemma, word, type)

        if result_item is None:
            result_item = AethelListItem(lemma=lemma, word=word, type=type)
            self.results.append(result_item)

        result_item.samples.append(
            AethelSample(name=sample_name, sentence=sample_sentence)
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
    def get(self, request: HttpRequest) -> JsonResponse:
        query_input = self.request.query_params.get("query", None)
        if query_input is None or len(query_input) < 3:
            return AethelListResponse().json_response()

        # First we select all relevant samples from the dataset that contain the query string.
        query_result = search(
            bank=dataset.samples,
            query=in_word(query_input.lower()) | in_lemma(query_input.lower()),
        )

        def item_contains_query_string(item: LexicalItem) -> bool:
            return (
                query_input.lower() in item.lemma.lower()
                or query_input.lower() in item.word.lower()
            )

        response_object = AethelListResponse()
        # Then we loop over the samples and extract what we need from them (lemma, word, type etc.).
        for sample in query_result:
            lexical_phrases = sample.lexical_phrases
            for phrase in lexical_phrases:
                for item in phrase.items:
                    if item_contains_query_string(item):
                        response_object.add_result(
                            item.lemma,
                            item.word,
                            str(phrase.type),
                            sample.name,
                            sample.sentence,
                        )

        return response_object.json_response()


class AethelDetailView(APIView):
    def get(self, request: HttpRequest, pk: int):
        return Response("Success!", status=status.HTTP_200_OK)
