import { Component, DestroyRef, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AethelListReturnItem } from "../shared/types";
import { AethelApiService } from "../shared/services/aethel-api.service";
import { first, map } from "rxjs";
import {
    faChevronDown,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "pp-aethel",
    templateUrl: "./aethel.component.html",
    styleUrl: "./aethel.component.scss",
})
export class AethelComponent implements OnInit {
    public form = new FormGroup({
        aethelInput: new FormControl<string>("", {
            validators: [Validators.minLength(3)],
        }),
    });
    public rows: AethelListReturnItem[] = [];
    public loading$ = this.apiService.loading$;
    public submitted = this.apiService.output$.pipe(map(() => true));

    public icons = {
        chevronRight: faChevronRight,
        chevronDown: faChevronDown,
    };

    constructor(
        private apiService: AethelApiService,
        private destroyRef: DestroyRef,
        private route: ActivatedRoute,
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

        // If the route has a query parameter, we run a search with that query immediately.
        this.route.queryParams
            .pipe(
                first(),
                map((queryParams) => queryParams["query"]),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((query) => {
                this.form.controls.aethelInput.setValue(query);
                this.search();
            });
    }

    public search(): void {
        this.form.markAllAsTouched();
        this.form.controls.aethelInput.updateValueAndValidity();
        if (!this.form.controls.aethelInput.value) {
            return;
        }
        this.apiService.input$.next(this.form.controls.aethelInput.value);
    }

    public getSampleURL(sampleName: string): string[] {
        return ["sample", sampleName.replace(".xml", "")];
    }

    /**
     * Adds unique keys to the items in the array. This is needed for the table to keep track of the data and automatically collapse rows when the data changes.
     * @param items - The array of AethelReturnItem objects.
     * @returns An array of AethelReturnItem objects with unique keys.
     */
    private addUniqueKeys(
        items: AethelListReturnItem[],
    ): AethelListReturnItem[] {
        return items.map((item, index) => ({
            ...item,
            key: `${index}-${item.lemma}-${item.word}-${item.type}`,
        }));
    }
}
