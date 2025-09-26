import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  show(notification: Omit<Notification, 'id'>) {
    const id = this.generateId();
    this.notificationSubject.next({ ...notification, id });
  }

  success(message: string, duration = 3000) {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000) {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4000) {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration = 3000) {
    this.show({ type: 'info', message, duration });
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}