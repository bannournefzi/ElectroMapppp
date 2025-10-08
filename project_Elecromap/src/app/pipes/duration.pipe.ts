import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(minutes: number, format: 'short' | 'long' = 'short'): string {
    if (!minutes || minutes < 0) return '0 min';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (format === 'long') {
      if (hours > 0 && remainingMinutes > 0) {
        return `${hours} heure${hours > 1 ? 's' : ''} et ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        return `${hours} heure${hours > 1 ? 's' : ''}`;
      } else {
        return `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
      }
    } else {
      if (hours > 0 && remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}min`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${remainingMinutes}min`;
      }
    }
  }
}
