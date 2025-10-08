import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeAgoPipe } from '../pipes/time-ago.pipe';
import { DurationPipe } from './duration.pipe';
import { BatteryLevelPipe } from './battery-level.pipe';
import { CostPipe } from './cost.pipe';
import { EnergyPipe } from './energy.pipe';

@NgModule({
  declarations: [
    TimeAgoPipe,
    DurationPipe,
    BatteryLevelPipe,
    CostPipe,
    EnergyPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TimeAgoPipe,
    DurationPipe,
    BatteryLevelPipe,
    CostPipe,
    EnergyPipe
  ]
})
export class PipesModule {}
