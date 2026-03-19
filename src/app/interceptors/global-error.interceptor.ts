import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

import { Globals } from '@app/services/globals.service';
import { ErrorService } from '@app/services/error.service';

interface ApiErrorPayload {
  title?: string;
  detail?: string;
  message?: string;
  instance?: string;
  errors?: Record<string, unknown>;
}

const asApiErrorPayload = (value: unknown): ApiErrorPayload => {
  if (!value || typeof value !== 'object') {
    return {};
  }
  return value as ApiErrorPayload;
};


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

      let title = 'Request failed';
      let message = 'An unexpected error occurred.';
      let postAction: (() => void) | null = null;
      const payload = asApiErrorPayload(err.error);

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
        const msg = payload.message ?? err.message;
        title = 'Authentication failed';
        message = `${msg} Please check your credentials and try again.`;
      }

      /**
       * Forbidden
       */
      else if (err.status === 403) {
        title = 'Access denied';
        message = 'You do not have permission to perform this action.';
        postAction = () => router.navigateByUrl('/');
      }

      /**
       * Not found 404
       */
      else if (err.status === 404) {
        title = 'Not found';
        const url =
          payload.instance ||
          err.url ||
          'Unknown endpoint';

        message = `The requested endpoint was not found:\n${url}`;
      }
      /**
       * Not found 405
       */
      else if (err.status === 405) {
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
        title =
          payload.title ??
          'Invalid operation';

        message =
          payload.detail ??
          err.message ??
          'The requested operation is not allowed in the current state.';
      }

      /**
       * Validation / bad request
       */
      else if (err.status === 400 || err.status === 422) {
        title = payload.title ?? 'Validation failed';

        if (typeof err.error === 'string') {
          message = err.error;
        } else if (err.error && typeof err.error === 'object') {
          const baseMessage =
            payload.detail ??
            payload.message ??
            'One or more validation errors occurred.';

          const validationDetails = formatValidationErrors(err.error);
          message = validationDetails ? `${baseMessage}\n${validationDetails}` : baseMessage;
        } else {
          message = 'One or more validation errors occurred.';
        }
      }

      /**
       * Server-side errors
       */
      else if (err.status >= 500) {
        title = payload.title ?? 'Server error';
        message =
          payload.detail ??
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
        instance: payload.instance,
        autoDismissMs: undefined
      });

      if (postAction) {
        postAction();
      }

      return throwError(() => err);
    })
  );
};
