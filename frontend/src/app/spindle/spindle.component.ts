import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { ApiService, SpindleMode } from "../shared/services/api.service";
import { ErrorHandlerService } from "../shared/services/error-handler.service";

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
    private destroy$ = new Subject<void>();

    constructor(
        private apiService: ApiService,
        private errorHandler: ErrorHandlerService,
    ) {}

    ngOnInit(): void {
        this.apiService
            .spindleResult$()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                if (response.errors && response.errors.length > 0) {
                    this.errorHandler.handleError(response.errors.join(", "));
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
            });
    }

    export(mode: SpindleMode): void {
        this.spindleInput.markAsTouched();
        this.spindleInput.updateValueAndValidity();
        const userInput = this.spindleInput.value;
        if (this.spindleInput.invalid || !userInput) {
            return;
        }
        this.apiService.spindleInput$.next({ mode, sentence: userInput });
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
