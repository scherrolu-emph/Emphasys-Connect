import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PostLoginService {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  async route(): Promise<void> {
    if (this.auth.isHfa()) {
      await this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
      await this.router.navigate(['/my-cases'], { replaceUrl: true });
    }
  }
}
