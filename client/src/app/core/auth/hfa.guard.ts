import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const hfaGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.session() === null) return router.parseUrl('/login');
  if (!auth.isHfa()) return router.parseUrl('/my-cases');
  return true;
};
