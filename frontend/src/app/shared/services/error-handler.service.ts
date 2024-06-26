import { ErrorHandler, Injectable } from "@angular/core";
import { AlertService } from "./alert.service";
import { AlertType } from "../components/alert/alert.component";
import { HttpErrorResponse } from "@angular/common/http";
import { SpindleErrorSource } from "../types";

const spindleErrorMapping: Record<SpindleErrorSource, string> = {
    [SpindleErrorSource.LATEX]: $localize`An error occurred while compiling your PDF.`,
    [SpindleErrorSource.SPINDLE]: $localize`An error occurred while parsing your sentence.`,
    [SpindleErrorSource.GENERAL]: $localize`An error occurred while processing your input.`,
    [SpindleErrorSource.INPUT]: $localize`Your input is invalid.`,
};

@Injectable({
    providedIn: "root",
})
export class ErrorHandlerService implements ErrorHandler {
    constructor(private alertService: AlertService) {}

    handleHttpError(error: HttpErrorResponse, message?: string): void {
        if (error.status === 0) {
            // Client-side or network error
            console.error("An error occurred:", error.error);
        } else {
            // Unsuccessful response code from backend
            console.error(
                `Backend returned code ${error.status}, body was: `,
                error.error,
            );
        }

        const errorMessage =
            message ?? $localize`An error occurred. Please try again later.`;

        this.alertService.alert$.next({
            type: AlertType.DANGER,
            message: errorMessage,
        });
    }

    handleError(errorMessage: string): void {
        this.alertService.alert$.next({
            type: AlertType.DANGER,
            message: errorMessage,
        });
    }

    handleSpindleError(error: SpindleErrorSource): void {
        this.alertService.alert$.next({
            type: AlertType.DANGER,
            message: spindleErrorMapping[error],
        });
    }
}
