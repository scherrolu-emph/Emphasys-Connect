import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  chatbubbleOutline,
  personAddOutline,
  documentTextOutline,
  logOutOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/notification/notification.service';
import { NotificationPanelService } from '../../core/notification/notification-panel.service';
import type { NotificationType } from '../../core/supabase/database.types';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss'],
})
export class NotificationPanelComponent {
  private readonly auth = inject(AuthService);
  private readonly notifSvc = inject(NotificationService);
  private readonly panelSvc = inject(NotificationPanelService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  readonly open = this.panelSvc.open;
  readonly anchorBottom = this.panelSvc.anchorBottom;
  readonly anchorRight = this.panelSvc.anchorRight;
  readonly notifications = this.notifSvc.notifications;
  readonly overdueItems = this.notifSvc.overdueItems;

  constructor() {
    addIcons({ warningOutline, chatbubbleOutline, personAddOutline, documentTextOutline, logOutOutline });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.open()) return;
    const path = event.composedPath() as EventTarget[];
    const panelEl = this.elementRef.nativeElement as HTMLElement;
    const bellEl = this.panelSvc.anchorHostEl;
    if (!path.includes(panelEl) && !(bellEl && path.includes(bellEl))) {
      this.panelSvc.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.panelSvc.close();
  }

  async signOut(): Promise<void> {
    this.panelSvc.close();
    await this.auth.signOut();
  }

  navigateTo(caseId: string | null): void {
    if (!caseId) return;
    void this.router.navigate(['/cases', caseId]);
    this.panelSvc.close();
  }

  typeIcon(type: NotificationType): string {
    switch (type) {
      case 'mention': return 'chatbubble-outline';
      case 'tagged': return 'person-add-outline';
      case 'assigned': return 'document-text-outline';
    }
  }

  relativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
}
