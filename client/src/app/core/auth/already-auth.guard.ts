import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const alreadyAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.session() === null) return true;
  return auth.isHfa() ? router.parseUrl('/dashboard') : router.parseUrl('/my-cases');
};
