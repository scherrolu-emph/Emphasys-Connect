import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, ViewDidEnter } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth.service';
import { PostLoginService } from '../../../core/auth/post-login.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle],
})
export class OtpPage implements ViewDidEnter, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly postLogin = inject(PostLoginService);

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  @ViewChild('otpInput') private otpInputRef?: ElementRef<HTMLInputElement>;

  // Angular Router writes navigation state to history.state on arrival
  readonly email: string = (history.state as { email?: string })?.email ?? '';

  readonly otp = signal('');
  readonly isVerifying = signal(false);
  readonly isResending = signal(false);
  readonly resendCooldown = signal(0);
  readonly error = signal<string | null>(null);

  ionViewDidEnter(): void {
    this.otpInputRef?.nativeElement.focus();
  }

  async verify(): Promise<void> {
    const code = this.otp().trim();
    if (code.length !== 6) {
      this.error.set('Please enter all 6 digits.');
      return;
    }

    this.error.set(null);
    this.isVerifying.set(true);
    try {
      await this.auth.verifyOtp(this.email, code);
      await this.postLogin.route();
    } catch {
      this.error.set('Invalid or expired code — please try again.');
      this.otp.set('');
    } finally {
      this.isVerifying.set(false);
    }
  }

  async resend(): Promise<void> {
    if (this.resendCooldown() > 0 || this.isResending()) return;

    this.error.set(null);
    this.isResending.set(true);
    try {
      await this.auth.signInWithOtp(this.email);
      this.startCooldown();
    } catch {
      this.error.set('Could not resend code. Please try again.');
    } finally {
      this.isResending.set(false);
    }
  }

  private startCooldown(): void {
    this.resendCooldown.set(30);
    this.cooldownTimer = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.resendCooldown.set(0);
        clearInterval(this.cooldownTimer!);
        this.cooldownTimer = null;
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer !== null) {
      clearInterval(this.cooldownTimer);
    }
  }
}
