import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingStationListComponent } from './charging-station-list.component';

describe('ChargingStationListComponent', () => {
  let component: ChargingStationListComponent;
  let fixture: ComponentFixture<ChargingStationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChargingStationListComponent]
    });
    fixture = TestBed.createComponent(ChargingStationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
