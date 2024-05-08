import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AethelApiService } from "../shared/services/aethel-api.service";

@Component({
    selector: "pp-sample",
    templateUrl: "./sample.component.html",
    styleUrl: "./sample.component.scss",
})
export class SampleComponent {
    private sampleName = this.route.snapshot.params['sampleName'];
    public sample$ = this.apiService.sample$(this.sampleName);

    constructor(
        private route: ActivatedRoute,
        private apiService: AethelApiService
    ) { }

    ngOnInit(): void {
        this.sample$.subscribe((response) => {
            console.log(response);
        });
    }


}
