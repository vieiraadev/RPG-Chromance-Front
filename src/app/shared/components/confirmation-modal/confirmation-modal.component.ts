import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmationService, ConfirmationData } from '../../../core/services/confirmation.service';

interface ConfirmationItem extends ConfirmationData {
  id: string;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  private confirmationService = inject(ConfirmationService);
  private subscription?: Subscription;
  
  currentConfirmation: ConfirmationItem | null = null;

  ngOnInit(): void {
    this.subscription = this.confirmationService.confirmation$.subscribe(confirmation => {
      this.currentConfirmation = confirmation;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  confirm(): void {
    if (this.currentConfirmation) {
      this.confirmationService.respond(this.currentConfirmation.id, true);
      this.currentConfirmation = null;
    }
  }

  cancel(): void {
    if (this.currentConfirmation) {
      this.confirmationService.respond(this.currentConfirmation.id, false);
      this.currentConfirmation = null;
    }
  }

  getTypeClass(): string {
    return `modal-${this.currentConfirmation?.type || 'warning'}`;
  }
}