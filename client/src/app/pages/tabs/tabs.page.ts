import { Component, inject } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-router-outlet></ion-router-outlet>
    <app-bottom-nav [isHfa]="isHfa()" />
  `,
  standalone: true,
  imports: [IonRouterOutlet, BottomNavComponent],
})
export class TabsPage {
  private readonly auth = inject(AuthService);
  readonly isHfa = this.auth.isHfa;
}
