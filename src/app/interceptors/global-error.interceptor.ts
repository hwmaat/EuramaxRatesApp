import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError, of } from 'rxjs';

import { Globals } from '@app/services/globals.service';
import { ErrorService } from '@app/services/error.service';


/**
 * Guards to avoid repeated navigation / spam
 */
let navigatedToServerDown = false;

const formatValidationErrors = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const errors = (payload as { errors?: Record<string, unknown> }).errors;
  if (!errors || typeof errors !== 'object') {
    return null;
  }

  const details: string[] = [];

  for (const [field, value] of Object.entries(errors)) {
    if (Array.isArray(value)) {
      details.push(`${field}: ${value.join(', ')}`);
    } else if (value !== null && value !== undefined) {
      details.push(`${field}: ${String(value)}`);
    }
  }

  return details.length > 0 ? details.join('\n') : null;
};

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router        = inject(Router);
  const globals       = inject(Globals);
  const errorService  = inject(ErrorService);


  return next(req).pipe(

    /**
     * Any successful response means the server is reachable again
     */
    tap({
      next: () => {
        if (!globals.serverAvailable()) {
          globals.setServerAvailable(true);
          navigatedToServerDown = false;

          if (router.url.startsWith('/error/server-down')) {
            router.navigateByUrl('/');
          }
        }
      }
    }),

    /**
     * Centralized error handling
     */
    catchError((err: HttpErrorResponse) => {

      //console.log('global-error.interceptor.ts ==> err', err);

      let title = 'Request failed';
      let message = 'An unexpected error occurred.';
      let postAction: (() => void) | null = null;

      // status === 0 means: no HTTP response (network/CORS/abort)
      // NEVER log out on this

      

      if (err.status === 0) {
        globals.setServerAvailable(false);

        errorService.show({
          title: 'Server not reachable',
          message: `No response received from backend.\n\n${err.url ?? ''}`,
          severity: 'error',
          status: 0,
          autoDismissMs: undefined
        });

        return throwError(() => err);
      }

      /**
       * Unauthorized
       */

      else if (err.status === 401) {
        console.log('global-error.interceptor ==> procname 401', err);
        const msg = (err.error as any)?.message ?? err.message;
        title = 'Authentication failed';
        message = `${msg} Please check your credentials and try again.`;
      }

      /**
       * Forbidden
       */
      else if (err.status === 403) {
        console.log('global-error.interceptor ==> procname 403', err);
        title = 'Access denied';
        message = 'You do not have permission to perform this action.';
        postAction = () => router.navigateByUrl('/');
      }

      /**
       * Not found 404
       */
      else if (err.status === 404) {
        console.log('global-error.interceptor ==> procname 404', err);
        title = 'Not found';
        const url =
          (err.error as any)?.instance ||
          err.url ||
          'Unknown endpoint';

        message = `The requested endpoint was not found:\n${url}`;
        console.log('global-error.interceptor ==> message:', message);
      }
      /**
       * Not found 405
       */
      else if (err.status === 405) {
        console.log('global-error.interceptor ==> procname 405', err);
        title = 'Method not allowed';

        const method = err.headers?.get('Allow')
          ? `Allowed: ${err.headers.get('Allow')}`
          : '';

        const url = err.url ?? 'Unknown endpoint';

        message =
          `The endpoint exists but does not support this HTTP method.\n\n` +
          `${url}\n${method}`;
      }
      else if (err.status === 409) {
        console.log('global-error.interceptor ==> procname 409',err);
        title =
          (err.error as any)?.title ??
          'Invalid operation';

        message =
          (err.error as any)?.detail ??
          err.message ??
          'The requested operation is not allowed in the current state.';
      }

      /**
       * Validation / bad request
       */
      else if (err.status === 400 || err.status === 422) {
        console.log('global-error.interceptor ==> procname 400', err);
        const payload = err.error;
        title = (payload as any)?.title ?? 'Validation failed';

        if (typeof payload === 'string') {
          message = payload;
        } else if (payload && typeof payload === 'object') {
          const baseMessage =
            (payload as any)?.detail ??
            (payload as any)?.message ??
            'One or more validation errors occurred.';

          const validationDetails = formatValidationErrors(payload);
          message = validationDetails ? `${baseMessage}\n${validationDetails}` : baseMessage;
        } else {
          message = 'One or more validation errors occurred.';
        }
      }

      /**
       * Server-side errors
       */
      else if (err.status >= 500) {
        console.log('global-error.interceptor ==> procname', err.status);
        title = (err.error as any)?.title ?? 'Server error';
        message =
          (err.error as any)?.detail ??
          'The server encountered an error. Please try again later.';
      }

      /**
       * 🔴 SINGLE UX HANDOFF (no dialogs, no alerts)
       */
      let severity: 'info' | 'warning' | 'error';

      if (err.status === 0 || err.status >= 500) {
        severity = 'error';
      }
      else if (err.status === 400 || err.status === 404 || err.status === 422) {
        severity = 'warning';
      }
      else {
        severity = 'info';
      }


      errorService.show({
        title,
        message,
        severity,
        status: err.status,
        instance: (err.error as any)?.instance,

        autoDismissMs:
          severity === 'info' ? 5000 :
          severity === 'warning' ? 7000 :
          undefined   // errors stay until user closes
      });

      if (postAction) {
        postAction();
      }

      return throwError(() => err);
    })
  );
};
