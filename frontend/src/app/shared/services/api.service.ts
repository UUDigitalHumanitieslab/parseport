import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "./error-handler.service";
import { Observable, Subject, catchError, of, switchMap } from "rxjs";

// This should be the same as the one in the backend.
export const enum SpindleErrorSource {
    INPUT = "input",
    SPINDLE = "spindle",
    LATEX = "latex",
    GENERAL = "general",
}

export interface SpindleReturn {
    error?: SpindleErrorSource;
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

    public spindleResult$(): Observable<SpindleReturn | null> {
        return this.spindleInput$.pipe(
            switchMap((input) =>
                this.http
                    .post<SpindleReturn | null>(
                        `/api/spindle/${input.mode}`,
                        { input: input.sentence },
                        {
                            headers: new HttpHeaders({
                                "Content-Type": "application/json",
                            }),
                        },
                    )
                    .pipe(
                        catchError((error) => {
                            this.errorHandler.handleHttpError(
                                error,
                                $localize`An error occurred while handling your input.`,
                            );
                            // Returning null instead of EMPTY (which completes)
                            // because the outer observable should be notified
                            return of(null);
                        }),
                    ),
            ),
        );
    }
}
