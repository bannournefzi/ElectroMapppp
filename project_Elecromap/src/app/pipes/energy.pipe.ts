import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'energy' })
export class EnergyPipe implements PipeTransform {
  transform(kWh: number, unit: 'kWh' | 'Wh' = 'kWh'): string {
    if (!kWh || kWh < 0) return `0 ${unit}`;
    return unit === 'Wh' ? `${(kWh * 1000).toFixed(0)} Wh` : `${kWh.toFixed(1)} kWh`;
  }
}
