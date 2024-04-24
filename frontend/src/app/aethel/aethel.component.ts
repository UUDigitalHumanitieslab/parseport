import { Component, DestroyRef, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AethelReturnItem } from "../shared/services/types";
import { AethelApiService } from "../shared/services/aethel-api.service";
import { map } from "rxjs";
import {
    faChevronDown,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: "pp-aethel",
    templateUrl: "./aethel.component.html",
    styleUrl: "./aethel.component.scss",
})
export class AethelComponent implements OnInit {
    form = new FormGroup({
        aethelInput: new FormControl<string>("", {
            validators: [Validators.minLength(3)],
        }),
    });
    rows: AethelReturnItem[] = [];
    loading$ = this.apiService.loading$;
    submitted = this.apiService.output$.pipe(map(() => true));

    faChevronRight = faChevronRight;
    faChevronDown = faChevronDown;

    constructor(
        private apiService: AethelApiService,
        private destroyRef: DestroyRef,
    ) {}

    ngOnInit(): void {
        this.apiService.output$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((response) => {
                // HTTP error
                if (!response) {
                    return;
                }
                if (response.error) {
                    // TODO: handle error!
                }
                this.rows = this.addUniqueKeys(response.results);
            });
    }

    public search(): void {
        if (!this.form.controls.aethelInput.value) {
            return;
        }
        this.apiService.input$.next(this.form.controls.aethelInput.value);
    }

    private addUniqueKeys(items: AethelReturnItem[]): AethelReturnItem[] {
        return items.map((item, index) => ({ ...item, key: index }));
    }
}
