import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { hfaGuard } from './hfa.guard';
import { AuthService } from './auth.service';

describe('hfaGuard', () => {
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      hfaGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', [], {
      session: jasmine.createSpy(),
      isHfa: jasmine.createSpy(),
    });
    routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    routerSpy.parseUrl.and.callFake((url: string) => ({ toString: () => url }) as any);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('redirects to /login when session is null', () => {
    (authSpy.session as jasmine.Spy).and.returnValue(null);
    (authSpy.isHfa as jasmine.Spy).and.returnValue(false);
    runGuard();
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
  });

  it('redirects to /my-cases when authenticated but not HFA', () => {
    (authSpy.session as jasmine.Spy).and.returnValue({ user: { id: '1' } });
    (authSpy.isHfa as jasmine.Spy).and.returnValue(false);
    runGuard();
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/my-cases');
  });

  it('returns true when session exists and user is HFA', () => {
    (authSpy.session as jasmine.Spy).and.returnValue({ user: { id: '1' } });
    (authSpy.isHfa as jasmine.Spy).and.returnValue(true);
    const result = runGuard();
    expect(result).toBeTrue();
  });
});
