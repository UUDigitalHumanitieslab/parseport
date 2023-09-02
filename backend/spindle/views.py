from typing import Literal
from django.http import HttpRequest, JsonResponse
from django.views import View
import urllib3
from urllib.parse import quote
import json
import base64


class SpindleView(View):
    def post(self, request: HttpRequest, mode: Literal["tex", "pdf", "overleaf"]):
        user_prompt = request.body.decode("utf-8")

        # Sending data to Spindle container.
        response = urllib3.request(
            method="POST", url="http://localhost:32768/", body=user_prompt
        )
        if response.status != 200:
            return JsonResponse({"tex": None, "error": "Spindle container error."})

        spindle_response = response.data
        tex = json.loads(spindle_response)["results"]

        # Return LaTeX code immediately.
        if mode == "tex":
            return JsonResponse({"tex": tex, "error": None})

        # Forward LaTeX code to LaTeX service.
        # Return PDF
        if mode == "pdf":
            response = urllib3.request(
                method="POST", url="http://localhost:32769/", body=tex
            )

            if response.status != 200:
                return JsonResponse(
                    {"pdf": None, "tex": tex, "error": "LaTeX container error."}
                )

            pdf = response.data
            pdf_base64_string = base64.b64encode(pdf).decode("utf-8")

            return JsonResponse(
                {
                    "tex": tex,
                    "pdf": pdf_base64_string,
                }
            )

        # Compose a link to Overleaf.
        # quote() is used to escape special characters.
        if mode == "overleaf":
            redirect_url = f"https://www.overleaf.com/docs?snip={quote(tex)}"

            return JsonResponse({"redirect": redirect_url})

        return JsonResponse({"error": "Invalid mode."})
