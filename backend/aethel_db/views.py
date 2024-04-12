from dataclasses import asdict, dataclass, field
from typing import List, Optional
from django.http import HttpRequest, JsonResponse
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from aethel import ProofBank
from aethel.frontend import LexicalPhrase, Sample


if getattr(settings, "DEBUG", False) is False:
    dataset = ProofBank.load_data("./aethel_db/data/aethel_subset.pickle")
else:
    dataset = ProofBank.load_data("./src/aethel/data/aethel_1.0.0a5.pickle")


@dataclass
class AethelListItem:
    sentence: str
    lemma: str
    phrase: str
    type: str


@dataclass
class AethelListResponse:
    results: List[AethelListItem] = field(default_factory=list)
    error: Optional[str] = None

    def add_phrase(self, phrase: LexicalPhrase, sample: Sample) -> None:
        if len(phrase.items) > 1:
            print("Phrase has more items than one!:", phrase.items)
            return

        item = phrase.items[0]
        list_item = AethelListItem(
            lemma=item.lemma,
            phrase=phrase.string,
            type=str(phrase.type),
            sentence=sample.sentence
        )
        self.results.append(list_item)

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
        word_query = self.request.query_params.get("query", None)
        if word_query is None:
            return AethelListResponse().json_response()

        response_object = AethelListResponse()
        for sample in dataset.samples:
            lexical_phrases = sample.lexical_phrases
            for phrase in lexical_phrases:
                if word_query.lower() in phrase.string.lower():
                    response_object.add_phrase(phrase, sample)


        return response_object.json_response()


class AethelDetailView(APIView):
    def get(self, request: HttpRequest, pk: int):
        return Response("Success!", status=status.HTTP_200_OK)
