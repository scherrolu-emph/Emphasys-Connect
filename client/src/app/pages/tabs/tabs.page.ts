import { Component, inject } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-router-outlet></ion-router-outlet>
    <app-bottom-nav [isHfa]="isHfa()" />
    <app-notification-panel />
  `,
  standalone: true,
  imports: [IonRouterOutlet, BottomNavComponent, NotificationPanelComponent],
})
export class TabsPage {
  private readonly auth = inject(AuthService);
  readonly isHfa = this.auth.isHfa;
}
