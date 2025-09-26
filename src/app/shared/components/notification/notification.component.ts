import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private subscription?: Subscription;
  
  notifications: Notification[] = [];

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(notification => {
      this.addNotification(notification);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  addNotification(notification: Notification): void {
    this.notifications.push(notification);
    
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, notification.duration || 5000);
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  closeNotification(id: string): void {
    this.removeNotification(id);
  }
}