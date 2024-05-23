import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SampleComponent } from "./sample.component";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { routes } from "../routes";
import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import {
    AethelDetail,
    AethelDetailError,
    LexicalPhrase,
} from "../shared/types";
import { By } from "@angular/platform-browser";
import { ProofPipe } from "../shared/pipes/proof.pipe";

fdescribe("SampleComponent", () => {
    let component: SampleComponent;
    let fixture: ComponentFixture<SampleComponent>;
    let router: Router;
    let controller: HttpTestingController;

    const table = () => fixture.debugElement.query(By.css(".table"));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterModule.forRoot(routes)],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: {
                                sampleName: "cheese-tosti",
                            },
                        },
                    },
                },
            ],
            declarations: [SampleComponent, ProofPipe],
        }).compileComponents();

        fixture = TestBed.createComponent(SampleComponent);
        router = TestBed.inject(Router);
        controller = TestBed.inject(HttpTestingController);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should construct a valid route", () => {
        const spy = spyOn(router, "navigate");
        const items: LexicalPhrase["items"] = [
            {
                lemma: "test",
                pos: "2",
                pt: "2",
                word: "testQuery",
            },
        ];

        component.routeToAethel(items);
        expect(spy).toHaveBeenCalledOnceWith(["/aethel"], {
            queryParams: { query: "testQuery" },
        });
    });

    it("should handle a valid query param", () => {
        const validResult: AethelDetail = {
            error: null,
            result: {
                name: "name",
                phrases: [],
                sentence: "sentence",
                subset: "testing",
                term: "term",
            },
        };

        const req = controller.expectOne(
            "/api/aethel/sample?sample-name=cheese-tosti",
        );

        req.flush(validResult);
        fixture.detectChanges();

        expect(table()).toBeTruthy();
        controller.verify();
    });

    it("should handle an invalid query param", () => {
        const errorResult: AethelDetail = {
            error: AethelDetailError.SAMPLE_NOT_FOUND,
            result: null,
        };

        const req = controller.expectOne(
            "/api/aethel/sample?sample-name=cheese-tosti",
        );
        req.flush(errorResult);
        fixture.detectChanges();

        expect(table()).toBeFalsy();
        controller.verify();
    });
});
