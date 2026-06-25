import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { hfaGuard } from './core/auth/hfa.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'login/verify',
    loadComponent: () =>
      import('./pages/login/otp/otp.page').then(m => m.OtpPage),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [hfaGuard],
  },
  {
    path: 'my-cases',
    loadComponent: () =>
      import('./pages/my-cases/my-cases.page').then(m => m.MyCasesPage),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
