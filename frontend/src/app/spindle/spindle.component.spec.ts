import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpindleComponent } from './spindle.component';

describe('SpindleComponent', () => {
  let component: SpindleComponent;
  let fixture: ComponentFixture<SpindleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpindleComponent ]
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
