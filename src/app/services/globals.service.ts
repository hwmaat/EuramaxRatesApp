import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { IAppConfig } from '@app/models/app-config.model';
import { validateConfig } from '@app/helpers/config-validator';

@Injectable({ providedIn: 'root' })
export class Globals {
  // --- settings as a signal ---
  private readonly _settings = signal<IAppConfig | null>(null);
  readonly settings = this._settings.asReadonly();
  // RxJS view for existing consumers
  readonly settings$ = toObservable(this.settings);


  // --- environment mode (string) stream; keep as-is
  private environmentModeSubject = new BehaviorSubject<string>('');
  environmentMode$ = this.environmentModeSubject.asObservable();

  // --- error stream
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  // -- server state
  readonly apiKeyValid = signal<boolean>(true);
  readonly serverAvailable = signal<boolean>(true);
  setServerAvailable(value: boolean) {
    this.serverAvailable.set(value);
  }

  setApiKeyValid(value: boolean) {
    this.apiKeyValid.set(value);
  }
  // --- public API ---

  async setEnvironmentMode(mode: string): Promise<void> {
    try {
      const env = mode === 'prod' ? 'prod' : 'dev';

      // base-href aware (works under sub-paths)
      const configPath = new URL(`assets/config.${env}.json`, document.baseURI).toString();
      const configResponse = await fetch(configPath);
      if (!configResponse.ok) throw new Error(`Failed to load ${configPath}`);

      const raw = await configResponse.json();

      // Validate + normalize
      validateConfig(raw);
      const normalized = this.normalizeConfig(raw as IAppConfig);

      // Persist settings and mode
      this.setSettings(normalized);
      this.environmentModeSubject.next(mode);

      
    } catch (error) {
      console.error('Error setting environment mode:', error);
      this.setError(`Failed to load configuration for ${mode} environment: ${(error as Error).message}`);
      throw error;
    }
  }

  /** Set the current app settings (updates signal + settings$). */
  public setSettings(config: IAppConfig | null): void {
    this._settings.set(config);
  }

  public setError(message: string) {
    console.error('[Globals] Error:', message);
    this.errorSubject.next(message);
  }

  // Computed, normalized base URL (no trailing slash)
  readonly apiBaseUrl = computed(() => {
    const s = this._settings();
    const raw = s?.apiBaseUrl ?? '';
    return raw.replace(/\/+$/, '');
  });

  /** Build an absolute API URL from a path (accepts absolute URLs unchanged). */
  apiUrl(path: string): string {
    if (!path) return this.apiBaseUrl();
    if (/^https?:\/\//i.test(path)) return path; // already absolute

    const base = this.apiBaseUrl();
    if (!base) throw new Error('API base URL not configured. Ensure the initializer ran.');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`; // exactly one slash junction
  }

  private readonly TOKEN_KEY = 'auth_token';
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem(this.TOKEN_KEY);
  }

  private normalizeConfig(config: IAppConfig): IAppConfig {
    const trimmedUrl = (config.apiBaseUrl || '').trim().replace(/\/+$/, '');
    try {
      // Throws if invalid URL (e.g., empty or relative)
       
      new URL(trimmedUrl);
    } catch {
      throw new Error(`Configuration invalid. apiBaseUrl must be an absolute URL. Received: "${config.apiBaseUrl}"`);
    }
    return { ...config, apiBaseUrl: trimmedUrl };
  }
}
