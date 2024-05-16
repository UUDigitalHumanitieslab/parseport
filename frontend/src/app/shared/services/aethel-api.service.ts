import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
    Observable,
    Subject,
    catchError,
    distinctUntilChanged,
    map,
    merge,
    of,
    share,
    switchMap,
    throttleTime,
} from "rxjs";
import { environment } from "src/environments/environment";
import { AethelDetail, AethelListReturn } from "../types";
import { ErrorHandlerService } from "./error-handler.service";
import { ParsePortDataService } from "./ParsePortDataService";

@Injectable({
    providedIn: "root",
})
export class AethelApiService
    implements ParsePortDataService<string, AethelListReturn>
{
    input$ = new Subject<string>();

    throttledInput$ = this.input$.pipe(
        distinctUntilChanged(),
        throttleTime(300),
        share(),
    );

    output$ = this.throttledInput$.pipe(
        switchMap((input) => {
            const headers = new HttpHeaders({
                "Content-Type": "application/json",
            });

            const params = new HttpParams().set("query", input);

            return this.http
                .get<AethelListReturn | null>(`${environment.apiUrl}aethel/`, {
                    headers,
                    params,
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
        share(),
    );

    loading$: Observable<boolean> = merge(
        this.throttledInput$.pipe(map(() => true)),
        this.output$.pipe(map(() => false)),
    );

    constructor(
        private http: HttpClient,
        private errorHandler: ErrorHandlerService,
    ) {}

    public sampleResult$(sampleName: string): Observable<AethelDetail | null> {
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
        });
        const params = new HttpParams().set("sample-name", sampleName);
        return this.http
            .get<AethelDetail>(`${environment.apiUrl}aethel/sample`, {
                headers,
                params,
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
    }
}
