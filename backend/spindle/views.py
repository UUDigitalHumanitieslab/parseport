from enum import Enum
from typing import Literal, Optional
from django.http import HttpRequest, JsonResponse
from django.views import View
import urllib3
from urllib.parse import quote
import json
import base64


class SpindleError(Enum):
    SPINDLE = "spindle"
    LATEX = "latex"
    GENERAL = "general"


class SpindleResponse:
    def __init__(
        self,
        tex: Optional[str] = None,
        pdf: Optional[str] = None,
        redirect: Optional[str] = None,
        error: SpindleError = None,
    ):
        self.tex = tex
        self.pdf = pdf
        self.error = error
        self.redirect = redirect

    def jsonResponse(self) -> JsonResponse:
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
        user_prompt = request.body.decode("utf-8")

        # Sending data to Spindle container.
        spindle_reponse = urllib3.request(
            method="POST",
            url="http://localhost:32768/",
            body=user_prompt,
            headers={"Content-Type": "application/json"},
        )
        if spindle_reponse.status != 200:
            return SpindleResponse(error=SpindleError.SPINDLE).jsonResponse()

        parse_result = spindle_reponse.data
        tex = json.loads(parse_result)["results"]

        # Return LaTeX code immediately.
        if mode == "tex":
            return SpindleResponse(tex=tex).jsonResponse()

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
                return SpindleResponse(tex=tex, error=SpindleError.LATEX).jsonResponse()

            pdf = latex_response.data
            pdf_base64_string = base64.b64encode(pdf).decode("utf-8")

            return SpindleResponse(tex=tex, pdf=pdf_base64_string).jsonResponse()

        # Compose a link to Overleaf.
        # quote() is used to escape special characters.
        if mode == "overleaf":
            redirect_url = f"https://www.overleaf.com/docs?snip={quote(tex)}"

            return SpindleResponse(redirect=redirect_url).jsonResponse()

        # Should never happen.
        return SpindleResponse(error=SpindleError.GENERAL).jsonResponse()
