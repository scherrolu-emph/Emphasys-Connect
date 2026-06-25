import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseOutline, checkboxOutline, listOutline } from 'ionicons/icons';

interface NavTab {
  route: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [IonIcon],
  template: `
    <nav class="bottom-nav">
      @for (tab of tabs(); track tab.route) {
        <button
          class="nav-tab"
          [class.nav-tab--active]="router.url === tab.route"
          (click)="router.navigate([tab.route])"
          [attr.aria-label]="tab.label"
        >
          <ion-icon [name]="tab.icon" aria-hidden="true"></ion-icon>
          <span>{{ tab.label }}</span>
        </button>
      }
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      background: var(--ion-toolbar-background, #fff);
      border-top: 1px solid var(--ion-border-color, #e0e0e0);
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 999;
    }
    .nav-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 4px;
      gap: 3px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--ion-color-medium, #92949c);
      font-size: 10px;
      font-family: inherit;
    }
    .nav-tab ion-icon { font-size: 22px; }
    .nav-tab--active { color: var(--ion-color-primary, #3880ff); }
  `],
})
export class BottomNavComponent {
  readonly isHfa = input.required<boolean>();
  readonly router = inject(Router);

  readonly tabs = computed<NavTab[]>(() => [
    this.isHfa()
      ? { route: '/dashboard', label: 'Cases', icon: 'briefcase-outline' }
      : { route: '/my-cases', label: 'My Cases', icon: 'briefcase-outline' },
    { route: '/my-tasks', label: 'My Tasks', icon: 'checkbox-outline' },
    { route: '/activity', label: 'Activity', icon: 'list-outline' },
  ]);

  constructor() {
    addIcons({ briefcaseOutline, checkboxOutline, listOutline });
  }
}
