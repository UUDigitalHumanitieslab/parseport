import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { ApiService, LexicalPhrase, SpindleMode } from "../shared/services/api.service";
import { ErrorHandlerService } from "../shared/services/error-handler.service";
import { AlertService } from "../shared/services/alert.service";
import { AlertType } from "../shared/components/alert/alert.component";

@Component({
    selector: "dh-spindle",
    templateUrl: "./spindle.component.html",
    styleUrls: ["./spindle.component.scss"],
})
export class SpindleComponent implements OnInit, OnDestroy {
    spindleInput = new FormControl<string>("", {
        validators: [Validators.required],
    });
    texOutput: string | null = null;
    loading: SpindleMode | null = null;
    term: string | null = null;
    lexicalPhrases: LexicalPhrase[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
        private errorHandler: ErrorHandlerService,
    ) {}

    ngOnInit(): void {
        this.apiService
            .spindleResult$()
            .pipe(takeUntil(this.destroy$))
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
                if (response.tex) {
                    this.texOutput = response.tex;
                }
                if (response.redirect) {
                    // Opens a new tab.
                    window.open(response.redirect, "_blank");
                }
                if (response.pdf) {
                    this.downloadPDF(response.pdf);
                }
                if (response.term && response.lexical_phrases) {
                    this.term = response.term;
                    this.lexicalPhrases = response.lexical_phrases;
                }
            });
    }

    parse() {
        this.export('term-table');
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
        this.texOutput = null;
        this.apiService.spindleInput$.next({ mode, sentence: userInput });
    }

    copyToClipboard(): void {
        if (!this.texOutput) {
            this.alertService.alert$.next({
                message: $localize`Failed to copy to clipboard.`,
                type: AlertType.DANGER,
            });
            return;
        }
        navigator.clipboard
            .writeText(this.texOutput)
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Creates an anchor element `<a></a>` with
     * the base64 pdf source and a filename with the
     * HTML5 `download` attribute then clicks on it.
     * @param  {string} base64 The base64 pdf source
     * @return {void}
     */
    private downloadPDF(base64: string): void {
        const linkSource = `data:application/pdf;base64,${base64}`;
        const downloadLink = document.createElement("a");
        const fileName = "spindleParseResult.pdf";

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
        downloadLink.remove();
    }
}
