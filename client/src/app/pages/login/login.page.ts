import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { PostLoginService } from '../../core/auth/post-login.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle],
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly postLogin = inject(PostLoginService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly isSending = signal(false);
  readonly error = signal<string | null>(null);

  async sendCode(emailOverride?: string): Promise<void> {
    const target = emailOverride ?? this.email();

    if (!EMAIL_PATTERN.test(target)) {
      this.error.set('Please enter a valid email address.');
      return;
    }

    this.error.set(null);
    this.isSending.set(true);
    try {
      await this.auth.signInWithOtp(target);
      await this.router.navigate(['/login/verify'], {
        state: { email: target },
      });
    } catch (err) {
      console.error('[LoginPage] signInWithOtp error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      this.error.set(`Could not send code: ${msg}`);
    } finally {
      this.isSending.set(false);
    }
  }

  // Demo-only: bypasses OTP via password auth so no email delivery is needed
  async quickLogin(address: string): Promise<void> {
    this.email.set(address);
    this.error.set(null);
    this.isSending.set(true);
    try {
      await this.auth.signInWithPassword(address, 'Demo1234!');
      await this.postLogin.route();
    } catch (err) {
      console.error('[LoginPage] quickLogin error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      this.error.set(`Quick login failed: ${msg}`);
    } finally {
      this.isSending.set(false);
    }
  }
}
