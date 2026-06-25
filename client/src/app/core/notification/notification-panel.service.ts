import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationPanelService {
  readonly open = signal(false);
  readonly anchorBottom = signal(0);
  readonly anchorRight = signal(0);

  /** The host element of app-notification-bell, kept to exclude it from click-outside detection. */
  anchorHostEl: HTMLElement | null = null;

  toggle(anchorHostEl: HTMLElement): void {
    if (this.open()) {
      this.open.set(false);
      this.anchorHostEl = null;
      return;
    }
    const rect = anchorHostEl.getBoundingClientRect();
    this.anchorBottom.set(rect.bottom + 6);
    this.anchorRight.set(window.innerWidth - rect.right);
    this.anchorHostEl = anchorHostEl;
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
    this.anchorHostEl = null;
  }
}
