import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { ConfirmationModalComponent } from './shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent, ConfirmationModalComponent],
  template: `
    <app-notification></app-notification>
    <app-confirmation-modal></app-confirmation-modal>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}