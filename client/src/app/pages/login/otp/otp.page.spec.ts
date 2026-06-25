import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OtpPage } from './otp.page';
import { AuthService } from '../../../core/auth/auth.service';
import { PostLoginService } from '../../../core/auth/post-login.service';

describe('OtpPage', () => {
  let component: OtpPage;
  let fixture: ComponentFixture<OtpPage>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let postLoginSpy: jasmine.SpyObj<PostLoginService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['verifyOtp', 'signInWithOtp']);
    postLoginSpy = jasmine.createSpyObj('PostLoginService', ['route']);

    // Seed history.state with email for component initialisation
    history.replaceState({ email: 'user@example.com' }, '');

    await TestBed.configureTestingModule({
      imports: [OtpPage],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: PostLoginService, useValue: postLoginSpy },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OtpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reads email from history.state', () => {
    expect(component.email).toBe('user@example.com');
  });

  describe('verify', () => {
    it('shows error when OTP is fewer than 6 digits', async () => {
      component.otp.set('123');
      await component.verify();
      expect(component.error()).toContain('6 digits');
      expect(authSpy.verifyOtp).not.toHaveBeenCalled();
    });

    it('calls verifyOtp and routes on success', async () => {
      authSpy.verifyOtp.and.returnValue(Promise.resolve());
      postLoginSpy.route.and.returnValue(Promise.resolve());
      component.otp.set('123456');
      await component.verify();
      expect(authSpy.verifyOtp).toHaveBeenCalledWith('user@example.com', '123456');
      expect(postLoginSpy.route).toHaveBeenCalled();
    });

    it('shows error and clears OTP on wrong code', async () => {
      authSpy.verifyOtp.and.returnValue(Promise.reject(new Error('Invalid token')));
      component.otp.set('000000');
      await component.verify();
      expect(component.error()).toContain('Invalid or expired');
      expect(component.otp()).toBe('');
    });

    it('resets isVerifying to false after success', async () => {
      authSpy.verifyOtp.and.returnValue(Promise.resolve());
      postLoginSpy.route.and.returnValue(Promise.resolve());
      component.otp.set('123456');
      await component.verify();
      expect(component.isVerifying()).toBeFalse();
    });
  });

  describe('resend', () => {
    it('calls signInWithOtp and starts cooldown', async () => {
      authSpy.signInWithOtp.and.returnValue(Promise.resolve());
      await component.resend();
      expect(authSpy.signInWithOtp).toHaveBeenCalledWith('user@example.com');
      expect(component.resendCooldown()).toBe(30);
    });

    it('does nothing when cooldown is active', async () => {
      component.resendCooldown.set(15);
      await component.resend();
      expect(authSpy.signInWithOtp).not.toHaveBeenCalled();
    });

    it('shows error when resend fails', async () => {
      authSpy.signInWithOtp.and.returnValue(Promise.reject(new Error('Network error')));
      await component.resend();
      expect(component.error()).toContain('Could not resend');
    });

    it('counts down cooldown to zero', fakeAsync(() => {
      authSpy.signInWithOtp.and.returnValue(Promise.resolve());
      component.resend();
      tick(0); // resolve the promise
      tick(30000); // advance 30 seconds
      expect(component.resendCooldown()).toBe(0);
    }));
  });
});
