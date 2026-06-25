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
    path: 'create-case/type',
    loadComponent: () =>
      import('./pages/create-case/type/case-type-selection.page').then(
        m => m.CaseTypeSelectionPage,
      ),
    canActivate: [hfaGuard],
  },
  {
    path: 'create-case/search',
    loadComponent: () =>
      import('./pages/create-case/search/imc-project-search.page').then(
        m => m.ImcProjectSearchPage,
      ),
    canActivate: [hfaGuard],
  },
  {
    path: 'create-case/confirm',
    loadComponent: () =>
      import('./pages/create-case/confirm/create-case-confirm.page').then(
        m => m.CreateCaseConfirmPage,
      ),
    canActivate: [hfaGuard],
  },
  {
    path: 'create-case/create',
    loadComponent: () =>
      import('./pages/create-case/create/create-case-action.page').then(
        m => m.CreateCaseActionPage,
      ),
    canActivate: [hfaGuard],
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
