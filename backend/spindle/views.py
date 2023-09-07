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


# Checks whether string is JSON-parseable and has a specific key with a string value.
def is_json_and_has_str_key(json_string: str, key: str) -> Optional[SpindleErrorSource]:
    try:
        parsed_json = json.loads(json_string)
    except json.JSONDecodeError:
        logging.warn("Input is not JSON parseable:", json_string)
        return SpindleErrorSource.INPUT
    if not key in parsed_json:
        logging.warn("Key %s not found in input %s", key, json_string)
        return SpindleErrorSource.INPUT
    if not isinstance(parsed_json[key], str):
        logging.warn("%s in input %s is not a string.", key, json_string)
        return SpindleErrorSource.INPUT


class SpindleView(View):
    def post(self, request: HttpRequest, mode: Literal["tex", "pdf", "overleaf"]):
        request_body = request.body.decode("utf-8")

        request_error = is_json_and_has_str_key(request_body, "input")
        if request_error:
            return SpindleResponse(error=request_error)

        # Sending data to Spindle container.
        spindle_reponse = urllib3.request(
            method="POST",
            url="http://localhost:32768/",
            body=request_body,
            headers={"Content-Type": "application/json"},
        )
        if spindle_reponse.status != 200:
            logging.warn(
                "Received non-200 response from Spindle server for input %s",
                request_body,
            )
            return SpindleResponse(error=SpindleErrorSource.SPINDLE).json_response()

        spindle_response_body = spindle_reponse.data
        parse_result_error = is_json_and_has_str_key(spindle_response_body, "results")
        if parse_result_error:
            return SpindleResponse(error=parse_result_error)

        tex = json.loads(spindle_response_body)["results"]

        # Return LaTeX code immediately.
        if mode == "tex":
            return SpindleResponse(tex=tex).json_response()

        # Forward LaTeX code to LaTeX service.
        # Return PDF
        if mode == "pdf":
            latex_response = urllib3.request(
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

            pdf = latex_response.data
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
