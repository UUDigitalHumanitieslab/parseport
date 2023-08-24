import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpindleComponent } from './spindle.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('SpindleComponent', () => {
  let component: SpindleComponent;
  let fixture: ComponentFixture<SpindleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [SpindleComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpindleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
