from django.http import HttpRequest, JsonResponse
from django.views import View


class SpindleView(View):
    def post(self, request: HttpRequest, *args, **kwargs):
        request_body = request.body.decode("utf-8")

        # Send data to Spindle container here.

        return JsonResponse({"status": "Sentence received!"})
