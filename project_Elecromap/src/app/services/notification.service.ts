import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private defaultDurations = {
    success: 4000,
    info: 5000,
    warning: 6000,
    error: 8000
  };

  constructor() {}

  /**
   * Affiche une notification de succès
   */
  showSuccess(message: string, title: string = 'Succès', duration?: number): void {
    this.addNotification('success', title, message, duration);
  }

  /**
   * Affiche une notification d'erreur
   */
  showError(message: string, title: string = 'Erreur', duration?: number): void {
    this.addNotification('error', title, message, duration);
  }

  /**
   * Affiche une notification d'avertissement
   */
  showWarning(message: string, title: string = 'Attention', duration?: number): void {
    this.addNotification('warning', title, message, duration);
  }

  /**
   * Affiche une notification d'information
   */
  showInfo(message: string, title: string = 'Information', duration?: number): void {
    this.addNotification('info', title, message, duration);
  }

  /**
   * Ajoute une nouvelle notification
   */
  private addNotification(
    type: Notification['type'], 
    title: string, 
    message: string, 
    duration?: number,
    persistent: boolean = false
  ): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: duration || this.defaultDurations[type],
      persistent,
      timestamp: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-suppression si pas persistante
    if (!persistent && notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Supprime une notification
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Supprime toutes les notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Supprime toutes les notifications d'un type donné
   */
  clearByType(type: Notification['type']): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.type !== type);
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Génère un ID unique pour les notifications
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Retourne le nombre total de notifications
   */
  getNotificationCount(): number {
    return this.notificationsSubject.value.length;
  }

  /**
   * Retourne le nombre de notifications par type
   */
  getNotificationCountByType(type: Notification['type']): number {
    return this.notificationsSubject.value.filter(n => n.type === type).length;
  }

  /**
   * Vérifie s'il y a des notifications d'erreur
   */
  hasErrors(): boolean {
    return this.getNotificationCountByType('error') > 0;
  }

  /**
   * Affiche une notification personnalisée
   */
  showCustom(notification: Partial<Notification>): void {
    if (!notification.message) {
      console.error('Le message est requis pour une notification');
      return;
    }

    this.addNotification(
      notification.type || 'info',
      notification.title || 'Notification',
      notification.message,
      notification.duration,
      notification.persistent || false
    );
  }

  /**
   * Affiche une notification de chargement
   */
  showLoading(message: string = 'Chargement en cours...', title: string = ''): string {
    const notification: Notification = {
      id: this.generateId(),
      type: 'info',
      title,
      message,
      persistent: true,
      timestamp: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    return notification.id;
  }

  /**
   * Met à jour une notification existante
   */
  updateNotification(id: string, updates: Partial<Notification>): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => 
      notification.id === id ? { ...notification, ...updates } : notification
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Affiche une notification de confirmation d'action
   */
  showActionConfirmation(
    message: string,
    actionText: string = 'Annuler',
    onAction?: () => void,
    duration: number = 5000
  ): void {
    // Cette méthode pourrait être étendue pour supporter des boutons d'action
    // Pour l'instant, on utilise une notification warning simple
    this.showWarning(`${message} (${actionText} dans ${duration/1000}s)`, 'Action effectuée', duration);
  }
}