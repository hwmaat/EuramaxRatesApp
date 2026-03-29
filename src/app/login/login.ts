import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStateService } from '@app/services/auth-state.service';
import { Globals } from '@app/services/globals.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly authState = inject(AuthStateService);
  private readonly globals = inject(Globals);
  private readonly router = inject(Router);

  apiKey = '';
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  readonly canSubmit = computed(() => !this.submitting() && this.apiKey.trim().length > 0);

  ngOnInit(): void {
    this.apiKey = this.globals.settings()?.apiKey ?? '';
  }

  async submit(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }

    const settings = this.globals.settings();
    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      if (settings) {
        this.globals.setSettings({
          ...settings,
          apiKey: this.apiKey.trim()
        });
      }

      await this.authState.init();

      if (this.authState.status() === 'authenticated') {
        await this.router.navigateByUrl('/home');
        return;
      }

      this.errorMessage.set('Login failed. Please verify your API key.');
    } catch {
      this.errorMessage.set('Login failed. Please verify your API key and try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
