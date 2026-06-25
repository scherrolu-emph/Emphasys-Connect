import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginPage } from './login.page';
import { AuthService } from '../../core/auth/auth.service';
import { PostLoginService } from '../../core/auth/post-login.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let postLoginSpy: jasmine.SpyObj<PostLoginService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['signInWithOtp', 'signInWithPassword']);
    postLoginSpy = jasmine.createSpyObj('PostLoginService', ['route']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: PostLoginService, useValue: postLoginSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('branding', () => {
    it('renders the Emphasys logo image', () => {
      const img: HTMLImageElement = fixture.nativeElement.querySelector('img.login-logo');
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('assets/emphasys-logo.png');
      expect(img.getAttribute('alt')).toBe('Emphasys');
    });

    it('renders the Powered by Emphasys caption', () => {
      const el: HTMLElement = fixture.nativeElement.querySelector('.login-powered');
      expect(el).toBeTruthy();
      expect(el.textContent?.trim()).toBe('Powered by Emphasys');
    });
  });

  describe('sendCode', () => {
    it('shows validation error for empty email', async () => {
      component.email.set('');
      await component.sendCode();
      expect(component.error()).toContain('valid email');
      expect(authSpy.signInWithOtp).not.toHaveBeenCalled();
    });

    it('shows validation error for malformed email', async () => {
      component.email.set('notanemail');
      await component.sendCode();
      expect(component.error()).toContain('valid email');
      expect(authSpy.signInWithOtp).not.toHaveBeenCalled();
    });

    it('calls signInWithOtp and navigates on success', async () => {
      authSpy.signInWithOtp.and.returnValue(Promise.resolve());
      component.email.set('user@example.com');
      await component.sendCode();
      expect(authSpy.signInWithOtp).toHaveBeenCalledWith('user@example.com');
      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['/login/verify'],
        { state: { email: 'user@example.com' } }
      );
    });

    it('shows error message when signInWithOtp throws', async () => {
      authSpy.signInWithOtp.and.returnValue(Promise.reject(new Error('Rate limited')));
      component.email.set('user@example.com');
      await component.sendCode();
      expect(component.error()).toContain('Rate limited');
    });

    it('resets isSending to false after success', async () => {
      authSpy.signInWithOtp.and.returnValue(Promise.resolve());
      component.email.set('user@example.com');
      await component.sendCode();
      expect(component.isSending()).toBeFalse();
    });

    it('resets isSending to false after failure', async () => {
      authSpy.signInWithOtp.and.returnValue(Promise.reject(new Error('fail')));
      component.email.set('user@example.com');
      await component.sendCode();
      expect(component.isSending()).toBeFalse();
    });
  });

  describe('quickLogin', () => {
    it('calls signInWithPassword with demo password and routes on success', async () => {
      authSpy.signInWithPassword.and.returnValue(Promise.resolve());
      postLoginSpy.route.and.returnValue(Promise.resolve());
      await component.quickLogin('staff@hfa.demo');
      expect(authSpy.signInWithPassword).toHaveBeenCalledWith('staff@hfa.demo', 'Demo1234!');
      expect(postLoginSpy.route).toHaveBeenCalled();
    });

    it('shows error when signInWithPassword throws', async () => {
      authSpy.signInWithPassword.and.returnValue(Promise.reject(new Error('Invalid credentials')));
      await component.quickLogin('staff@hfa.demo');
      expect(component.error()).toContain('Invalid credentials');
    });
  });
});
