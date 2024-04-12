import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "./error-handler.service";
import { Observable, Subject, catchError, of, switchMap } from "rxjs";
import { environment } from "src/environments/environment";
import { AethelReturn, SpindleInput, SpindleReturn } from "./types";

@Injectable({
    providedIn: "root",
})
export class ApiService {
    spindleInput$ = new Subject<SpindleInput>();
    aethelInput$ = new Subject<string>();

    constructor(
        private http: HttpClient,
        private errorHandler: ErrorHandlerService,
    ) {}

    public spindleResult$(): Observable<SpindleReturn | null> {
        return this.spindleInput$.pipe(
            switchMap((input) =>
                this.http
                    .post<SpindleReturn | null>(
                        `${environment.apiUrl}spindle/${input.mode}`,
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

    public aethelResult$(): Observable<AethelReturn | null> {
        return this.aethelInput$.pipe(
            switchMap((input) => {
                console.log('Input:', input)

                const headers = new HttpHeaders({
                    "Content-Type": "application/json",
                });

                const params = new HttpParams().set("query", input);

                return this.http
                    .get<AethelReturn | null>(`${environment.apiUrl}aethel`, {
                        headers, params
                    })
                    .pipe(
                        catchError((error) => {
                            this.errorHandler.handleHttpError(
                                error,
                                $localize`An error occurred while handling your input.`,
                            );
                            return of(null);
                        }),
                    );
            }),
        );
    }
}
