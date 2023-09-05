import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "./error-handler.service";
import { EMPTY, Observable, Subject, catchError, switchMap } from "rxjs";

// This should be the same as the one in the backend.
export const enum SpindleError {
    SPINDLE = "spindle",
    LATEX = "latex",
    GENERAL = "general"
}

export interface SpindleReturn {
    error?: SpindleError;
    tex?: string;
    pdf?: string;
    redirect?: string;
}

export type SpindleMode = "tex" | "pdf" | "overleaf";

export interface SpindleInput {
    sentence: string;
    mode: SpindleMode;
}

@Injectable({
    providedIn: "root",
})
export class ApiService {
    spindleInput$ = new Subject<SpindleInput>();

    constructor(
        private http: HttpClient,
        private errorHandler: ErrorHandlerService,
    ) {}

    public spindleResult$(): Observable<SpindleReturn> {
        return this.spindleInput$.pipe(
            switchMap((input) =>
                this.http.post<SpindleReturn>(
                    `/api/spindle/${input.mode}`,
                    { input: input.sentence },
                    {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                        }),
                    },
                ),
            ),
            catchError((error) => {
                this.errorHandler.handleHttpError(
                    error,
                    $localize`An error occurred while handling your input.`,
                );
                return EMPTY;
            }),
        );
    }
}
