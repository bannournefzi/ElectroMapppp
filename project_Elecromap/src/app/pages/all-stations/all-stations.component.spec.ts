import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllStationsComponent } from './all-stations.component';

describe('AllStationsComponent', () => {
  let component: AllStationsComponent;
  let fixture: ComponentFixture<AllStationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllStationsComponent]
    });
    fixture = TestBed.createComponent(AllStationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
