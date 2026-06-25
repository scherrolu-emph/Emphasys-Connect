import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { supabase } from '../supabase/supabase.client';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    spyOn(supabase.auth, 'onAuthStateChange').and.returnValue({
      data: { subscription: { unsubscribe: jasmine.createSpy() } },
    } as any);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('session signal starts null', () => {
    expect(service.session()).toBeNull();
  });

  it('currentUser is null when session is null', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('isHfa is false when session is null', () => {
    expect(service.isHfa()).toBeFalse();
  });

  it('currentUser reflects session user', () => {
    const mockUser = { id: '1', user_metadata: { is_hfa: true } } as any;
    service.session.set({ user: mockUser } as any);
    expect(service.currentUser()).toBe(mockUser);
  });

  it('isHfa is true when user_metadata.is_hfa is true', () => {
    service.session.set({ user: { id: '1', user_metadata: { is_hfa: true } } } as any);
    expect(service.isHfa()).toBeTrue();
  });

  it('isHfa is false when user_metadata.is_hfa is false', () => {
    service.session.set({ user: { id: '1', user_metadata: { is_hfa: false } } } as any);
    expect(service.isHfa()).toBeFalse();
  });

  describe('restoreSession', () => {
    it('seeds session signal from getSession', async () => {
      const mockSession = { user: { id: '1' } } as any;
      spyOn(supabase.auth, 'getSession').and.returnValue(
        Promise.resolve({ data: { session: mockSession }, error: null })
      );
      await service.restoreSession();
      expect(service.session()).toBe(mockSession);
    });

    it('sets null when no session exists', async () => {
      spyOn(supabase.auth, 'getSession').and.returnValue(
        Promise.resolve({ data: { session: null }, error: null })
      );
      await service.restoreSession();
      expect(service.session()).toBeNull();
    });
  });

  describe('signInWithOtp', () => {
    it('throws when supabase returns an error', async () => {
      spyOn(supabase.auth, 'signInWithOtp').and.returnValue(
        Promise.resolve({ data: {} as any, error: new Error('Rate limited') as any })
      );
      await expectAsync(service.signInWithOtp('test@example.com')).toBeRejected();
    });

    it('resolves without error on success', async () => {
      spyOn(supabase.auth, 'signInWithOtp').and.returnValue(
        Promise.resolve({ data: {} as any, error: null })
      );
      await expectAsync(service.signInWithOtp('test@example.com')).toBeResolved();
    });
  });

  describe('verifyOtp', () => {
    it('throws when supabase returns an error', async () => {
      spyOn(supabase.auth, 'verifyOtp').and.returnValue(
        Promise.resolve({ data: {} as any, error: new Error('Invalid token') as any })
      );
      await expectAsync(service.verifyOtp('test@example.com', '123456')).toBeRejected();
    });

    it('resolves without error on success', async () => {
      spyOn(supabase.auth, 'verifyOtp').and.returnValue(
        Promise.resolve({ data: {} as any, error: null })
      );
      await expectAsync(service.verifyOtp('test@example.com', '123456')).toBeResolved();
    });
  });

  describe('signOut', () => {
    it('clears session signal and navigates to /login', async () => {
      service.session.set({ user: { id: '1' } } as any);
      spyOn(supabase.auth, 'signOut').and.returnValue(
        Promise.resolve({ error: null })
      );
      await service.signOut();
      expect(service.session()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
    });

    it('clears session and navigates even when signOut call fails', async () => {
      service.session.set({ user: { id: '1' } } as any);
      spyOn(supabase.auth, 'signOut').and.returnValue(
        Promise.resolve({ error: new Error('Network error') as any })
      );
      await service.signOut();
      expect(service.session()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
    });
  });
});
