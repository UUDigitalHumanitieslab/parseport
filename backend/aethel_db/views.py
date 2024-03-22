from django.http import HttpRequest
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from aethel import ProofBank

dataset = ProofBank.load_data("./src/aethel/data/aethel_1.0.0a5.pickle")


class AethelListView(APIView):

    def get_queryset(self):
        """
        Optionally filters the queryset based on the URL query parameters.
        """

        query_string = self.request.query_params.get("query", None)
        if query_string:
            return dataset.find_by_name(query_string)

        return dataset


class AethelDetailView(APIView):

    def get(self, request: HttpRequest, pk: int):
        return Response("Success!", status=status.HTTP_200_OK)
