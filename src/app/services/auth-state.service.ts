import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '@app/services/api.service';
import { Globals } from '@app/services/globals.service';

export type AuthStatus = 'unknown' | 'authenticated' | 'failed';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private api = inject(ApiService);
  private globals = inject(Globals);

  readonly status = signal<AuthStatus>('unknown');

  /**
   * Called at startup.
   * Implement one simple "ping" that requires the API key and returns 200 if valid.
   */
  async init(): Promise<void> {
    try {
      // Choose an endpoint that:
      // - requires API key
      // - is fast
      // - does not have side effects
      // Example: GET /health or /ping or /version
      const endpoint = this.globals.settings()?.authPingEndpoint ?? '/health';
      await firstValueFrom(this.api.pingWhenReady(endpoint));
      this.status.set('authenticated');
    } catch {
      this.status.set('failed');
    }
  }
}
