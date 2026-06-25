import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { participantCasesGuard } from './core/auth/participant-cases.guard';

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
    canActivate: [authGuard],
  },
  {
    path: 'my-cases',
    loadComponent: () =>
      import('./pages/my-cases/my-cases.page').then(m => m.MyCasesPage),
    canActivate: [participantCasesGuard],
  },
  {
    path: 'cases/:id',
    loadComponent: () =>
      import('./pages/case-detail/case-detail.page').then(m => m.CaseDetailPage),
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
