import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SampleComponent } from "./sample.component";
import { RouterModule } from "@angular/router";
import { routes } from "../routes";
import { HttpClientTestingModule } from "@angular/common/http/testing";


describe("SampleComponent", () => {
    let component: SampleComponent;
    let fixture: ComponentFixture<SampleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterModule.forRoot(routes)
            ],
            declarations: [SampleComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(SampleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should construct a valid route", () => { });
});
