import { Injectable } from '@angular/core';
import { AppError } from '@app/models/app-error.model';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ErrorService {

  private readonly errorSubject = new BehaviorSubject<AppError | null>(null);

  readonly error$ = this.errorSubject.asObservable();

  private dismissTimer: any;

  show(error: AppError): void {
    // Clear any previous timer
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    this.errorSubject.next(error);

    // Setup auto-dismiss if configured
    if (error.autoDismissMs && error.autoDismissMs > 0) {
      this.dismissTimer = setTimeout(() => {
        this.clear();
      }, error.autoDismissMs);
    }
  }

  clear(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    this.errorSubject.next(null);
  }
}
