from dataclasses import dataclass
from enum import Enum
from typing import Literal, Optional
from django.http import HttpRequest, JsonResponse
from django.views import View
import urllib3
from urllib.parse import quote
import json
import base64
import logging

http = urllib3.PoolManager()


class SpindleErrorSource(Enum):
    INPUT = "input"
    SPINDLE = "spindle"
    LATEX = "latex"
    GENERAL = "general"


@dataclass
class SpindleResponse:
    tex: Optional[str] = None
    pdf: Optional[str] = None
    redirect: Optional[str] = None
    error: SpindleErrorSource = None

    def json_response(self) -> JsonResponse:
        return JsonResponse(
            {
                "tex": self.tex,
                "pdf": self.pdf,
                "redirect": self.redirect,
                "error": self.error.value if self.error else None,
            }
        )


class SpindleView(View):
    def post(self, request: HttpRequest, mode: Literal["tex", "pdf", "overleaf"]):
        request_body = request.body.decode("utf-8")

        try:
            parsed_json = json.loads(request_body)
        except json.JSONDecodeError:
            logging.warn("Input is not JSON parseable:", request_body)
            return SpindleResponse(error=SpindleErrorSource.INPUT).json_response()

        if not "input" in parsed_json or not isinstance(parsed_json["input"], str):
            logging.warn("Key input with value of type string not found:", request_body)
            return SpindleResponse(error=SpindleErrorSource.INPUT).json_response()

        # Sending data to Spindle container.
        spindle_response = http.request(
            method="POST",
            url="http://localhost:32768/",
            body=request_body,
            headers={"Content-Type": "application/json"},
        )
        if spindle_response.status != 200:
            logging.warn(
                "Received non-200 response from Spindle server for input %s",
                request_body,
            )
            return SpindleResponse(error=SpindleErrorSource.SPINDLE).json_response()

        try:
            spindle_response_json = spindle_response.json()
        except json.JSONDecodeError:
            logging.warn("Spindle response is not JSON parseable: %s", spindle_response)
            return SpindleResponse(error=SpindleErrorSource.SPINDLE).json_response()

        # Check if the spindle response has a key called "results" and if it is a string.
        if not "results" in spindle_response_json or not isinstance(
            spindle_response_json["results"], str
        ):
            logging.warn(
                "Spindle response does not contain valid 'results': %s",
                spindle_response.body,
            )
            return SpindleResponse(error=SpindleErrorSource.SPINDLE).json_response()

        tex = spindle_response_json["results"]

        # Return LaTeX code immediately.
        if mode == "tex":
            return SpindleResponse(tex=tex).json_response()

        # Forward LaTeX code to LaTeX service.
        # Return PDF
        if mode == "pdf":
            latex_response = http.request(
                method="POST",
                url="http://localhost:32769/",
                body=tex,
                headers={"Content-Type": "application/tex"},
            )

            if latex_response.status != 200:
                logging.warn(
                    "Received non-200 response from LaTeX server for input %s", tex
                )
                return SpindleResponse(
                    tex=tex, error=SpindleErrorSource.LATEX
                ).json_response()

            try:
                pdf = latex_response.data
            except KeyError:
                logging.warn(
                    "LaTeX response does not contain valid 'data': %s", latex_response
                )
                return SpindleResponse(error=SpindleErrorSource.LATEX).json_response()

            pdf_base64_string = base64.b64encode(pdf).decode("utf-8")

            return SpindleResponse(tex=tex, pdf=pdf_base64_string).json_response()

        # Compose a link to Overleaf.
        # quote() is used to escape special characters.
        if mode == "overleaf":
            redirect_url = f"https://www.overleaf.com/docs?snip={quote(tex)}"
            return SpindleResponse(redirect=redirect_url).json_response()

        # Only if the query param is not 'tex', 'pdf' or 'overleaf'.
        # This should never happen.
        logging.warn("Received unexpected mode.")
        return SpindleResponse(error=SpindleErrorSource.GENERAL).json_response()
