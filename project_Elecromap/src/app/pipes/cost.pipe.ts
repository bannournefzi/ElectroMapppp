import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cost' })
export class CostPipe implements PipeTransform {
  transform(cost: number, includeCurrency: boolean = true): string {
    if (!cost || cost < 0) return includeCurrency ? '0,00 €' : '0,00';
    const formatted = cost.toFixed(2).replace('.', ',');
    return includeCurrency ? `${formatted} €` : formatted;
  }
}
