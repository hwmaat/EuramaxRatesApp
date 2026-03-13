import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject, effect } from "@angular/core";
import { BehaviorSubject, catchError, filter, Observable, of, switchMap, take } from "rxjs";
import { Globals } from "./globals.service";
import { VersionInfoDto } from "@app/models/version.model";


@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private globals = inject(Globals);
  private baseUrl$ = new BehaviorSubject<string>('');

  constructor() {
    effect(() => {
      const url = this.globals.apiBaseUrl();
      console.log('api.service ==> url', url);
      if (url) {
        this.baseUrl$.next(url.replace(/\/+$/, ''));
      }
    }); 
  }

  // ------- verbs -------
  get<T>(endpoint: string, spParams?: Map<string, string>) {
    return this.http.get<T>(this.buildUrl(endpoint), {
      params: this.buildParams(spParams)
    });
  }
  post<T>(endpoint: string, body: any, spParams?: Map<string, string>, options?: { headers?: HttpHeaders }) {
    return this.http.post<T>(this.buildUrl(endpoint), body, {
      params: this.buildParams(spParams),
      headers: options?.headers
    });
  }

  put<T>(endpoint: string, body: any, spParams?: Map<string, string>, options?: { headers?: HttpHeaders }) {
    return this.http.put<T>(this.buildUrl(endpoint), body, {
      params: this.buildParams(spParams),
      headers: options?.headers
    });
  }

  patch<T>(endpoint: string, body: any, spParams?: Map<string, string>, options?: { headers?: HttpHeaders }) {
    return this.http.patch<T>(this.buildUrl(endpoint), body, {
      params: this.buildParams(spParams),
      headers: options?.headers
    });
  }

  delete<T>(endpoint: string, spParams?: Map<string, string>, options?: { headers?: HttpHeaders }) {
    return this.http.delete<T>(this.buildUrl(endpoint), {
      params: this.buildParams(spParams),
      headers: options?.headers
    });
  }

  ping(endpoint: string) {
    return this.get<void>(endpoint);
  }

  pingWhenReady(endpoint: string) {
    return this.baseUrlReady$.pipe(
      switchMap(() => this.ping(endpoint))
    );
  }

// ------- helpers -------

  private buildUrl(endpoint: string): string {
    const base = this.baseUrl$.value || '';
    const ep = endpoint.replace(/^\/+/, ''); // trim leading slash
    return `${base}/${ep}`;
  }

private buildParams(spParams?: Map<string, any>): HttpParams {
  let params = new HttpParams();

  if (spParams) {
    for (const [key, value] of spParams.entries()) {
      if (Array.isArray(value)) {
        // Append each item as a separate key=value pair
        value.forEach(v => {
          if (v !== null && v !== undefined)
            params = params.append(key, v.toString());
        });
      } else if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    }
  }

  return params;
}

  checkBackendVersionFromSettings(): Observable<boolean> {
  return this.globals.settings$.pipe(
    filter(cfg => !!cfg?.version),
    take(1),
    switchMap(cfg => {
      const feVersion = cfg.version;
      return this.checkBackendVersion(feVersion);
    })
  );
  }
    /** Compare provided FE version to backend version. Returns true if match or API unreachable. */
    checkBackendVersion(feVersion: string): Observable<boolean> {
    return this.getBackendVersion().pipe(
        take(1),
        catchError(err => {
        // At this point, globalErrorInterceptor has ALREADY run and shown
        // "Server not available." for status === 0.
        console.warn(
            '[ApiService] Version check failed; treating as OK to avoid blocking startup.',
            err
        );
        return of<VersionInfoDto | null>(null);
        }),
        switchMap(dto => {
        // No version info (e.g., server down) -> don’t block app
        if (!dto) return of(true);

        const be = dto.fileVersion || dto.assemblyVersion;
        const match = be === feVersion;

        if (!match) {
            const key = `version-mismatch-shown-${be}-${feVersion}`;
            if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, '1');
            alert(
                `A new version is available on the server.\n\n` +
                `Server: ${be}\nClient: ${feVersion}\n\n` +
                `Please press CTRL+F5 to refresh with the latest files.`
            );
            }
        }

        return of(match);
        })
    );
    }

    private baseUrlReady$ = this.baseUrl$.pipe(
    filter(url => !!url),
    take(1)
    );

    getBackendVersion(): Observable<VersionInfoDto> {
    return this.baseUrlReady$.pipe(
        switchMap(baseUrl => this.get<VersionInfoDto>(`version`))
    );
    }

}