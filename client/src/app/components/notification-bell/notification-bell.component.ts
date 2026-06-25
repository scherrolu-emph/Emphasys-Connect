import { Component, ElementRef, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline } from 'ionicons/icons';
import { NotificationService } from '../../core/notification/notification.service';
import { NotificationPanelService } from '../../core/notification/notification-panel.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent {
  private readonly notifSvc = inject(NotificationService);
  private readonly panelSvc = inject(NotificationPanelService);
  private readonly elementRef = inject(ElementRef);

  readonly totalBadge = this.notifSvc.totalBadge;

  constructor() {
    addIcons({ notificationsOutline });
  }

  toggle(): void {
    this.panelSvc.toggle(this.elementRef.nativeElement);
    if (this.panelSvc.open()) {
      void this.notifSvc.markAllRead();
    }
  }
}
