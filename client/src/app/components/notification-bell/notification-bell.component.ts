import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline, warningOutline, chatbubbleOutline, personAddOutline, documentTextOutline } from 'ionicons/icons';
import { NotificationService } from '../../core/notification/notification.service';
import type { NotificationType } from '../../core/supabase/database.types';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent {
  private readonly notifSvc = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  readonly totalBadge = this.notifSvc.totalBadge;
  readonly notifications = this.notifSvc.notifications;
  readonly overdueItems = this.notifSvc.overdueItems;
  readonly panelOpen = signal(false);

  constructor() {
    addIcons({ notificationsOutline, warningOutline, chatbubbleOutline, personAddOutline, documentTextOutline });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const el = this.elementRef.nativeElement as HTMLElement;
    if (!el.contains(event.target as Node)) {
      this.panelOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.panelOpen.set(false);
  }

  togglePanel(): void {
    const opening = !this.panelOpen();
    this.panelOpen.set(opening);
    if (opening) {
      void this.notifSvc.markAllRead();
    }
  }

  navigateTo(caseId: string | null): void {
    if (!caseId) return;
    void this.router.navigate(['/cases', caseId]);
    this.panelOpen.set(false);
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
