import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from './config.service';


@Injectable({
    providedIn: 'root'
})
export class BackendService {
    protected apiUrl: Promise<string> | null = null;

    constructor(protected config: ConfigService, protected http: HttpClient) { }

    /**
     * Collect JSON from an specific url.
     * @param objectUrl The part of the URL after the backendUrl from config.json.
     * (i.e. whatever comes after, for example, '/api/').
     * Note that this method will add a '/' at the end of the url if it does not exist.
     */
    async get(objectUrl: string): Promise<any> {
        const baseUrl = await this.getApiUrl();
        if (!objectUrl.endsWith('/')) { objectUrl = `${objectUrl}/`; }
        const url: string = encodeURI(baseUrl + objectUrl);

        try {
            return await lastValueFrom(this.http.get(url));
        } catch (error) {
            return await this.handleError(error);
        }
    }

    getApiUrl(): Promise<string> {
        if (!this.apiUrl) {
            return this.config.get().then(config => config.backendUrl);
        } else {
            return Promise.resolve(this.apiUrl);
        }
    }

    protected handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
