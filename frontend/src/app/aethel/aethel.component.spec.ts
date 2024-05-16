import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AethelComponent } from "./aethel.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { routes } from "../routes";

describe("AethelComponent", () => {
    let component: AethelComponent;
    let fixture: ComponentFixture<AethelComponent>;

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

        fixture = TestBed.createComponent(AethelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
