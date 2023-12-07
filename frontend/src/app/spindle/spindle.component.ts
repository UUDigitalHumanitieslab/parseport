import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import {
    ApiService,
    LexicalPhrase,
    SpindleMode,
} from "../shared/services/api.service";
import { ErrorHandlerService } from "../shared/services/error-handler.service";
import { AlertService } from "../shared/services/alert.service";
import { AlertType } from "../shared/components/alert/alert.component";
import { JsonPipe } from "@angular/common";

import { faDownload, faCopy } from "@fortawesome/free-solid-svg-icons";

interface TextOutput {
    extension: 'json' | 'tex';
    text: string;
}

@Component({
    selector: "dh-spindle",
    templateUrl: "./spindle.component.html",
    styleUrls: ["./spindle.component.scss"],
})
export class SpindleComponent implements OnInit, OnDestroy {
    spindleInput = new FormControl<string>("", {
        validators: [Validators.required],
    });
    term: string | null = null;
    textOutput: TextOutput | null = null;
    lexicalPhrases: LexicalPhrase[] = [];
    loading: SpindleMode | null = null;

    parsed = false;

    faCopy = faCopy;
    faDownload = faDownload;

    private destroy$ = new Subject<void>();

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
        private errorHandler: ErrorHandlerService,
        private JSONPipe: JsonPipe,
    ) {}

    ngOnInit(): void {
        this.apiService
            .spindleResult$()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                this.loading = null;
                if (response.error) {
                    this.errorHandler.handleSpindleError(response.error);
                    return;
                }
                if (response.latex) {
                    this.textOutput = {
                        extension: 'tex',
                        text: response.latex
                    }
                }
                if (response.redirect) {
                    // Opens a new tab.
                    window.open(response.redirect, "_blank");
                }
                if (response.pdf) {
                    const base64 = response.pdf;
                    const linkSource = `data:application/pdf;base64,${base64}`;
                    const fileName = "spindleParseResult.pdf";
                    this.downloadFile(fileName, linkSource);
                }
                if (response.term && response.lexical_phrases) {
                    this.term = response.term;
                    this.lexicalPhrases = response.lexical_phrases;
                    this.parsed = true;
                }
                if (response.proof) {
                    this.textOutput = {
                        extension: 'json',
                        text: this.JSONPipe.transform(response.proof)
                    }
                }
            });
    }

    parse(): void {
        this.export("term-table");
    }

    export(mode: SpindleMode | null): void {
        this.spindleInput.markAsTouched();
        this.spindleInput.updateValueAndValidity();
        const userInput = this.spindleInput.value;
        if (this.spindleInput.invalid || !userInput) {
            return;
        }
        this.loading = mode;
        this.clearResults();
        this.apiService.spindleInput$.next({
            mode: mode ?? "term-table",
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

    downloadAsFile(textData: string, extension: 'tex' | 'json'): void {
        const fileName = "spindleParseResult." + extension;
        const blob = new Blob([textData], { type: `application/${extension}` });
        const url = window.URL.createObjectURL(blob);
        this.downloadFile(fileName, url);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
        window.URL.revokeObjectURL(url);
    }
}
