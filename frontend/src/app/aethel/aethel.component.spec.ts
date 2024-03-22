import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AethelComponent } from './aethel.component';

describe('AethelComponent', () => {
  let component: AethelComponent;
  let fixture: ComponentFixture<AethelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AethelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AethelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
