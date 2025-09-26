import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface ConfirmationResult {
  confirmed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new Subject<ConfirmationData & { id: string }>();
  private resultSubject = new Subject<{ id: string; confirmed: boolean }>();
  
  confirmation$ = this.confirmationSubject.asObservable();
  result$ = this.resultSubject.asObservable();

  confirm(data: ConfirmationData): Observable<boolean> {
    const id = this.generateId();
    
    return new Observable(observer => {
      this.confirmationSubject.next({ ...data, id });
      
      const subscription = this.result$.subscribe(result => {
        if (result.id === id) {
          observer.next(result.confirmed);
          observer.complete();
          subscription.unsubscribe();
        }
      });
    });
  }

  respond(id: string, confirmed: boolean): void {
    this.resultSubject.next({ id, confirmed });
  }

  private generateId(): string {
    return `confirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}