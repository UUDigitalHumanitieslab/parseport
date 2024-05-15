import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

interface Status {
    aethel: boolean;
    spindle: boolean;
}

@Injectable({
    providedIn: "root"
})
export class StatusService{
    constructor(private http: HttpClient) {}

    get(): Observable<Status> {
        return this.http.get<Status>(`${environment.apiUrl}status/`);
    }
}
