import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '@app/services/auth-state.service';

export const bootstrapGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthStateService);
  console.log('bootstrap.guard ==> authenticated', auth.status());
  return router.createUrlTree([
    
    auth.status() === 'authenticated' ? 'home' : 'login'
  ]);
};
