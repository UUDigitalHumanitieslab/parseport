import { Component, DestroyRef, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { ApiService } from "../shared/services/api.service";
import { AethelReturnItem } from "../shared/services/types";

@Component({
    selector: "pp-aethel",
    templateUrl: "./aethel.component.html",
    styleUrl: "./aethel.component.scss",
})
export class AethelComponent implements OnInit {
    aethelInput = new FormControl<string>("");
    rows: AethelReturnItem[] = [];
    loading = false;
    submitted = false;

    constructor(
        private apiService: ApiService,
        private destroyRef: DestroyRef,
    ) {}

    ngOnInit(): void {
        this.apiService
            .aethelResult$()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                // HTTP error
                if (!response) {
                    return;
                }
                if (response.error) {
                    // TODO: handle error!
                }
                this.rows = response.results;
            });
    }

    search(): void {
        if (!this.aethelInput.value) {
            return;
        }
        this.loading = true;
        this.apiService.aethelInput$.next(this.aethelInput.value);
    }
}
