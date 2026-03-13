import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Globals } from '@app/services/globals.service';

const API_KEY_HEADER = 'X-Api-Key'; 

export const authTokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const globals = inject(Globals);

  const apiKey = (globals.settings()?.apiKey ?? '').trim();
console.log('auth-token.interceptor ==> apiKey', apiKey);
  if (apiKey && !req.headers.has(API_KEY_HEADER)) {
    req = req.clone({
      setHeaders: {
        [API_KEY_HEADER]: apiKey
      }
    });
  }

  return next(req);
};
