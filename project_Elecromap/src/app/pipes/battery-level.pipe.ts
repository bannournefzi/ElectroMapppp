import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'batteryLevel' })
export class BatteryLevelPipe implements PipeTransform {
  transform(percentage: number): { level: string; color: string; icon: string } {
    if (percentage >= 80) {
      return { level: 'Excellente', color: '#10b981', icon: 'fas fa-battery-full' };
    } else if (percentage >= 60) {
      return { level: 'Bonne', color: '#10b981', icon: 'fas fa-battery-three-quarters' };
    } else if (percentage >= 40) {
      return { level: 'Moyenne', color: '#f59e0b', icon: 'fas fa-battery-half' };
    } else if (percentage >= 20) {
      return { level: 'Faible', color: '#f59e0b', icon: 'fas fa-battery-quarter' };
    } else {
      return { level: 'Critique', color: '#ef4444', icon: 'fas fa-battery-empty' };
    }
  }
}
