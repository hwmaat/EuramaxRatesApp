import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '@app/services/auth-state.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthStateService);

  if (auth.status() === 'authenticated') {
    return true;
  }

  return router.createUrlTree(['login']);
};
