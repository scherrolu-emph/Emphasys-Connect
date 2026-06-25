import { Component, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseOutline, listOutline, checkboxOutline, pulseOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { TaskBadgeService } from '../../core/tasks/task-badge.service';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        @if (isHfa()) {
          <ion-tab-button tab="dashboard">
            <ion-icon name="briefcase-outline"></ion-icon>
            <ion-label>Cases</ion-label>
          </ion-tab-button>
        } @else {
          <ion-tab-button tab="my-cases">
            <ion-icon name="list-outline"></ion-icon>
            <ion-label>My Cases</ion-label>
          </ion-tab-button>
        }
        <ion-tab-button tab="my-tasks">
          <ion-icon name="checkbox-outline"></ion-icon>
          <ion-label>My Tasks</ion-label>
          @if (taskBadge.count() > 0) {
            <ion-badge color="danger">{{ taskBadge.count() }}</ion-badge>
          }
        </ion-tab-button>
        <ion-tab-button disabled>
          <ion-icon name="pulse-outline"></ion-icon>
          <ion-label>Activity</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
})
export class TabsPage {
  private readonly auth = inject(AuthService);
  readonly taskBadge = inject(TaskBadgeService);
  readonly isHfa = this.auth.isHfa;

  constructor() {
    addIcons({ briefcaseOutline, listOutline, checkboxOutline, pulseOutline });
  }
}
