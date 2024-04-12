import { Component, DestroyRef, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from "../shared/services/api.service";
import { ErrorHandlerService } from "../shared/services/error-handler.service";
import { AlertService } from "../shared/services/alert.service";
import { AlertType } from "../shared/components/alert/alert.component";
import { faDownload, faCopy } from "@fortawesome/free-solid-svg-icons";
import { LexicalPhrase, SpindleMode } from "../shared/services/types";

interface TextOutput {
    extension: "json" | "tex";
    text: string;
}

@Component({
    selector: "pp-spindle",
    templateUrl: "./spindle.component.html",
    styleUrls: ["./spindle.component.scss"],
})
export class SpindleComponent implements OnInit {
    spindleInput = new FormControl<string>("", {
        validators: [Validators.required],
    });
    term: string | null = null;
    textOutput: TextOutput | null = null;
    lexicalPhrases: LexicalPhrase[] = [];
    loading: SpindleMode | null = null;

    faCopy = faCopy;
    faDownload = faDownload;

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
        private errorHandler: ErrorHandlerService,
        private destroyRef: DestroyRef
    ) {}

    ngOnInit(): void {
        this.apiService
            .spindleResult$()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                this.loading = null;
                // HTTP error
                if (!response) {
                    return;
                }
                if (response.error) {
                    this.errorHandler.handleSpindleError(response.error);
                    return;
                }
                if (response.latex) {
                    this.textOutput = {
                        extension: "tex",
                        text: response.latex,
                    };
                }
                if (response.redirect) {
                    // Opens a new tab.
                    window.open(response.redirect, "_blank");
                }
                if (response.pdf) {
                    const base64 = response.pdf;
                    this.downloadAsFile(base64, "pdf");
                }
                if (response.term && response.lexical_phrases) {
                    this.term = response.term;
                    this.lexicalPhrases = response.lexical_phrases;
                }
                if (response.proof) {
                    this.textOutput = {
                        extension: "json",
                        // The additional arguments are for pretty-printing.
                        text: JSON.stringify(response.proof, null, 2),
                    };
                }
                if (response.term && response.lexical_phrases) {
                    this.term = response.term;
                    this.lexicalPhrases = response.lexical_phrases;
                }
            });
    }

    parse(): void {
        this.clearResults();
        this.export("term-table");
    }

    get parsed(): boolean {
        return this.term !== null && this.lexicalPhrases.length > 0;
    }

    export(mode: SpindleMode): void {
        this.spindleInput.markAsTouched();
        this.spindleInput.updateValueAndValidity();
        const userInput = this.spindleInput.value;
        if (this.spindleInput.invalid || !userInput) {
            return;
        }
        this.loading = mode;
        this.apiService.spindleInput$.next({
            mode,
            sentence: userInput,
        });
    }

    copyToClipboard(text: string): void {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                this.alertService.alert$.next({
                    message: $localize`Copied to clipboard.`,
                    type: AlertType.SUCCESS,
                });
            })
            .catch(() => {
                this.alertService.alert$.next({
                    message: $localize`Failed to copy to clipboard.`,
                    type: AlertType.DANGER,
                });
            });
    }

    downloadAsFile(textData: string, extension: "tex" | "json" | "pdf"): void {
        const fileName = "spindleParseResult." + extension;
        let url = "";
        // PDF data (base64) does not need to be converted to a blob.
        if (extension === "pdf") {
            url = `data:application/pdf;base64,${textData}`;
        } else {
            const blob = new Blob([textData], {
                type: `application/${extension}`,
            });
            url = window.URL.createObjectURL(blob);
        }

        this.downloadFile(fileName, url);

        // Revoke the object URL after downloading.
        if (extension !== "pdf") {
            this.revokeObjectURL(url);
        }
    }

    private clearResults(): void {
        this.term = null;
        this.textOutput = null;
        this.lexicalPhrases = [];
    }

    private downloadFile(fileName: string, url: string): void {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        link.remove();
    }

    private revokeObjectURL(url: string): void {
        window.URL.revokeObjectURL(url);
    }
}
