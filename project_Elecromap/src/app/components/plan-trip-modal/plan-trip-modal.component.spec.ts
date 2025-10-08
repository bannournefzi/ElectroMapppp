import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanTripModalComponent } from './plan-trip-modal.component';

describe('PlanTripModalComponent', () => {
  let component: PlanTripModalComponent;
  let fixture: ComponentFixture<PlanTripModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlanTripModalComponent]
    });
    fixture = TestBed.createComponent(PlanTripModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
