import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "./error-handler.service";
import { Observable, Subject, catchError, of, switchMap } from "rxjs";
import { environment } from "src/environments/environment";

// This should be the same as the one in the backend.
export const enum SpindleErrorSource {
    INPUT = "input",
    SPINDLE = "spindle",
    LATEX = "latex",
    GENERAL = "general",
}

type LexicalItem = {
    word: string;
    pos: string;
    pt: string;
    lemma: string;
};

export type LexicalPhrase = {
    items: LexicalItem[];
    type: string;
};

// Should correspond with SpindleResponse dataclass in backend.
export interface SpindleReturn {
    error: SpindleErrorSource | null;
    latex: string | null;
    pdf: string | null;
    redirect: string | null;
    term: string | null;
    lexical_phrases: LexicalPhrase[];
    proof: Record<string, unknown> | null;
}

export type SpindleMode = "latex" | "pdf" | "overleaf" | "term-table" | "proof";

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
                        `${environment.apiUrl}${input.mode}`,
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
