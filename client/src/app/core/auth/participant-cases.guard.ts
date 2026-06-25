import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const participantCasesGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.session() === null) {
    return router.parseUrl('/login');
  }

  return auth.isHfa() ? router.parseUrl('/dashboard') : true;
};
