import base64
import json
import logging
import urllib3
from dataclasses import dataclass
from enum import Enum
from typing import Literal, Optional
from urllib.parse import quote

from django.conf import settings
from django.http import HttpRequest, JsonResponse
from django.views import View

http = urllib3.PoolManager()


# Output mode
Mode = Literal["tex", "pdf", "overleaf"]


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
    error: Optional[SpindleErrorSource] = None

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
    def post(self, request: HttpRequest, mode: Mode):
        data = self.read_request(request)
        if data is None:
            return SpindleResponse(error=SpindleErrorSource.INPUT).json_response()

        tex = self.send_to_parser(data)
        if tex is None:
            return SpindleResponse(error=SpindleErrorSource.SPINDLE).json_response()

        if mode == "tex":
            return self.latex_response(tex)
        elif mode == "pdf":
            return self.pdf_response(tex)
        elif mode == "overleaf":
            return self.overleaf_redirect(tex)

        # Only if the query param is not a valid mode
        # This should never happen.
        logging.warn("Received unexpected mode.")
        return SpindleResponse(error=SpindleErrorSource.GENERAL).json_response()

    def send_to_parser(self, text: str) -> Optional[str]:
        """Send request to downstream (natural language) parser"""
        # Sending data to Spindle container.
        spindle_response = http.request(
            method="POST",
            url=settings.SPINDLE_URL,
            body=json.dumps({"input": text}),
            headers={"Content-Type": "application/json"},
        )

        if spindle_response.status != 200:
            logging.warn(
                "Received non-200 response from Spindle server for input %s", text
            )
            return

        try:
            spindle_response_json = spindle_response.json()
        except json.JSONDecodeError as e:
            logging.warn("Spindle response is not JSON parseable: %s", e.msg)
            return

        # Check if the spindle response has a key called "results" and if it is a string.
        if "results" in spindle_response_json and isinstance(
            spindle_response_json["results"], str
        ):
            return spindle_response_json["results"]

        logging.warn(
            "Spindle response does not contain valid 'results': %s",
            json.dumps(spindle_response_json),
        )

    def read_request(self, request: HttpRequest) -> Optional[str]:
        """Read and validate the HTTP request received from the frontend"""
        request_body = request.body.decode("utf-8")

        try:
            parsed_json = json.loads(request_body)
        except json.JSONDecodeError:
            logging.warn("Input is not JSON parseable: %s", request_body)
            return None

        if not "input" in parsed_json or not isinstance(parsed_json["input"], str):
            logging.warn("Key input with value of type string not found:", request_body)
            return None

        return parsed_json["input"]

    def latex_response(self, tex: str) -> JsonResponse:
        """Return LaTeX code immediately."""
        return SpindleResponse(tex=tex).json_response()

    def pdf_response(self, tex) -> JsonResponse:
        """Forward LaTeX code to LaTeX service. Return PDF"""
        latex_response = http.request(
            method="POST",
            url=settings.LATEX_SERVICE_URL,
            body=tex,
            headers={"Content-Type": "application/tex"},
        )

        if latex_response.status != 200:
            logging.warn(
                "Received non-200 response from LaTeX server for input %s", tex
            )
            return SpindleResponse(error=SpindleErrorSource.LATEX).json_response()

        try:
            pdf = latex_response.data
        except KeyError:
            logging.warn(
                "LaTeX response does not contain valid 'data': %s", latex_response
            )
            return SpindleResponse(error=SpindleErrorSource.LATEX).json_response()

        # PDF generated succesfully
        pdf_base64_string = base64.b64encode(pdf).decode("utf-8")
        return SpindleResponse(tex=tex, pdf=pdf_base64_string).json_response()

    def overleaf_redirect(self, tex: str) -> JsonResponse:
        """Compose a link to Overleaf."""
        # quote() is used to escape special characters.
        redirect_url = f"https://www.overleaf.com/docs?snip={quote(tex)}"
        return SpindleResponse(redirect=redirect_url).json_response()
