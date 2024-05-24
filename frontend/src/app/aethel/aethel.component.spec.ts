import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AethelComponent } from "./aethel.component";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { routes } from "../routes";
import { of } from "rxjs";

describe("AethelComponent", () => {
    let component: AethelComponent;
    let fixture: ComponentFixture<AethelComponent>;
    let httpController: HttpTestingController;
    let route: ActivatedRoute;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AethelComponent],
            imports: [
                HttpClientTestingModule,
                ReactiveFormsModule,
                CommonModule,
                RouterModule.forRoot(routes)
            ],
        }).compileComponents();
        httpController = TestBed.inject(HttpTestingController);
        route = TestBed.inject(ActivatedRoute);
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(AethelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should not request data if there is no query parameter", () => {
        route.queryParams = of({});
        component.ngOnInit();
        expect(component.form.controls.aethelInput.value).toBe("");
        httpController.expectNone("/api/aethel");
    });

    it("should request data when there is a query parameter on init", () => {
        route.queryParams = of({ query: "test" });
        component.ngOnInit();
        expect(component.form.controls.aethelInput.value).toBe("test");
        httpController.expectOne("/api/aethel/?query=test");
    });

    it("should react to form submissions", () => {
        const navigatorSpy = spyOn(router, "navigateByUrl");
        component.form.controls.aethelInput.setValue("test-two");
        component.submit();
        expect(navigatorSpy).toHaveBeenCalledWith("/?query=test-two");
    });
});
