import { ErrorHandler, Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import { AlertType } from '../components/alert/alert.component';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'   
})
export class ErrorHandlerService implements ErrorHandler {

    constructor(private alertService: AlertService) { }

    handleError(error: HttpErrorResponse, message?: string): void {
        if (error.status === 0) {
            // Client-side or network error
            console.error('An error occurred:', error.error);
        } else {
            // Unsuccessful response code from backend
            console.error(`Backend returned code ${error.status}, body was: `, error.error);
        }

        const errorMessage = message ?? $localize`An error occurred. Please try again later.`;

        this.alertService.alert$.next({
            type: AlertType.DANGER,
            message: errorMessage
        });
    }
}
