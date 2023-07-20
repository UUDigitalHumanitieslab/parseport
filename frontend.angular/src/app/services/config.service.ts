import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Config {
    backendUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private config?: Promise<Config>;

    constructor(private http: HttpClient) { }

    public get(): Promise<Config> {
        if (!this.config) {
            this.config = new Promise<Config>((resolve, reject) =>
                this.http.get(environment.assets + '/config.json').subscribe(response => {
                    resolve(response as Config);
                }));
        }

        return this.config;
    }
}
