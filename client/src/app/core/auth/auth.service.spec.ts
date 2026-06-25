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
    it('resolves immediately without calling supabase when mockOtp is enabled', async () => {
      const spy = spyOn(supabase.auth, 'signInWithOtp');
      await expectAsync(service.signInWithOtp('test@example.com')).toBeResolved();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('throws when token does not match mockOtpCode', async () => {
      await expectAsync(service.verifyOtp('test@example.com', 'wrong-code'))
        .toBeRejectedWithError('Invalid code');
    });

    it('calls dev-mock-sign-in, verifies token_hash, and accepts pending invites', async () => {
      const invokeSpy = jasmine.createSpy('invoke').and.returnValue(
        Promise.resolve({ data: { hashed_token: 'mock-hash' }, error: null })
      );
      // supabase.functions getter returns a new FunctionsClient on every access —
      // spy on the getter itself so the service receives our mock object
      spyOnProperty(supabase, 'functions', 'get').and.returnValue({ invoke: invokeSpy } as any);

      const verifyOtpSpy = spyOn(supabase.auth, 'verifyOtp').and.returnValue(
        Promise.resolve({ data: { user: { id: 'user-1' }, session: null }, error: null } as any)
      );
      const eq2Spy = jasmine.createSpyObj('eq2', ['eq']);
      eq2Spy.eq.and.returnValue(Promise.resolve({ error: null }));
      const updateSpy = jasmine.createSpyObj('update', ['eq']);
      updateSpy.eq.and.returnValue(eq2Spy);
      const fromChainSpy = jasmine.createSpyObj('from', ['update']);
      fromChainSpy.update.and.returnValue(updateSpy);
      const fromSpy = spyOn(supabase, 'from').and.returnValue(fromChainSpy as any);

      await expectAsync(service.verifyOtp('test@example.com', '123456')).toBeResolved();
      expect(invokeSpy).toHaveBeenCalledWith('dev-mock-sign-in', jasmine.objectContaining({ body: { email: 'test@example.com' } }));
      expect(verifyOtpSpy).toHaveBeenCalledWith({ token_hash: 'mock-hash', type: 'email' });
      expect(fromSpy).toHaveBeenCalledWith('case_participants');
      expect(fromChainSpy.update).toHaveBeenCalledWith({ invite_status: 'accepted', user_id: 'user-1' });
    });

    it('skips case_participants update when verifyOtp returns no user', async () => {
      const invokeSpy = jasmine.createSpy('invoke').and.returnValue(
        Promise.resolve({ data: { hashed_token: 'mock-hash' }, error: null })
      );
      spyOnProperty(supabase, 'functions', 'get').and.returnValue({ invoke: invokeSpy } as any);
      spyOn(supabase.auth, 'verifyOtp').and.returnValue(
        Promise.resolve({ data: { user: null, session: null }, error: null } as any)
      );
      const fromSpy = spyOn(supabase, 'from');

      await expectAsync(service.verifyOtp('test@example.com', '123456')).toBeResolved();
      expect(fromSpy).not.toHaveBeenCalled();
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
