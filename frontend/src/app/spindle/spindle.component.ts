import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EMPTY, Subject, catchError, debounceTime, switchMap, takeUntil } from 'rxjs';
import { ErrorHandlerService } from '../shared/services/error-handler.service';

@Component({
  selector: 'dh-spindle',
  templateUrl: './spindle.component.html',
  styleUrls: ['./spindle.component.scss']
})
export class SpindleComponent implements OnInit, OnDestroy {
  spindleInput = new FormControl<string>('');
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.spindleInput.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(input => this.http.post('/api/spindle',
          { input },
          {} // Options with headers, credentials etc. go here.
        )),
        catchError(error => {
          this.errorHandler.handleHttpError(error, $localize`An error occurred while parsing your data.`);
          return EMPTY;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(response => {
        console.log('Response received!', response);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
