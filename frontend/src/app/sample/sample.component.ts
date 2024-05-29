import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AethelApiService } from "../shared/services/aethel-api.service";
import { map } from "rxjs";
import { LexicalPhrase } from "../shared/types";
import { isNonNull } from "../shared/operators/IsNonNull";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Location } from "@angular/common";

@Component({
    selector: "pp-sample",
    templateUrl: "./sample.component.html",
    styleUrl: "./sample.component.scss",
})
export class SampleComponent {
    private sampleName = this.route.snapshot.params["sampleName"];
    private sample$ = this.apiService.sampleResult$(this.sampleName);
    public sampleResult$ = this.sample$.pipe(
        map((response) => response?.result),
        isNonNull()
    );

    public icons = {
        arrowLeft: faArrowLeft,
    }

    constructor(
        private route: ActivatedRoute,
        private apiService: AethelApiService,
        private router: Router,
        private location: Location
    ) {}

    public routeToAethel(items: LexicalPhrase["items"]): void {
        const combined = items.map((item) => item.word).join(" ");
        this.router.navigate(["/aethel"], {
            queryParams: {
                query: combined,
            },
        });
    }

    public showButton(items: LexicalPhrase["items"]): boolean {
        const combined = items.map((item) => item.word).join(" ");
        return combined.length > 2;
    }

    public goBack(): void {
        this.location.back();
    }
}
