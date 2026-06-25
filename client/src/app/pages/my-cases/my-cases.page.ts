import { Component, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-my-cases',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>My Cases</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (auth.currentUser()) {
        <p>You'll be added to cases by your HFA.</p>
      }
    </ion-content>
  `,
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
})
export class MyCasesPage {
  readonly auth = inject(AuthService);
}
