import { Component, inject } from '@angular/core';
import { ErrorService } from '../../services/error.service';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-global-error',
  standalone: true,
  imports: [CommonModule, DxButtonModule],
  templateUrl: './global-error.component.html',
  styleUrls: ['./global-error.component.scss']
})
export class GlobalErrorComponent {

  private errorService = inject(ErrorService);

  error$ = this.errorService.error$;

  close(): void {
    this.errorService.clear();
  }

  iconClass(severity: 'info' | 'warning' | 'error'): string {
  switch (severity) {
    case 'info':
      return 'dx-icon-info';
    case 'warning':
      return 'dx-icon-warning';
    case 'error':
      return 'dx-icon-error';
  }
}
}
