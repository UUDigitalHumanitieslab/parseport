import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AethelComponent } from "./aethel.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

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
