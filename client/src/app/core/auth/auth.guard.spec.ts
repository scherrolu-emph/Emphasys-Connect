import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], { session: jasmine.createSpy() });
    routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    routerSpy.parseUrl.and.returnValue({ toString: () => '/login' } as any);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('returns true when session is non-null', () => {
    (authServiceSpy.session as jasmine.Spy).and.returnValue({ user: { id: '1' } });
    const result = runGuard();
    expect(result).toBeTrue();
  });

  it('redirects to /login when session is null', () => {
    (authServiceSpy.session as jasmine.Spy).and.returnValue(null);
    runGuard();
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
  });
});
