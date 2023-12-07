import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpindleComponent } from './spindle.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { ExportButtonComponent } from './export-button/export-button.component';

describe('SpindleComponent', () => {
  let component: SpindleComponent;
  let fixture: ComponentFixture<SpindleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [SpindleComponent, ExportButtonComponent],
      providers: [JsonPipe]
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
