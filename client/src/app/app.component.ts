import { Component, OnInit, computed, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './core/auth/auth.service';
import { NotificationBellComponent } from './components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NotificationBellComponent],
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);
  readonly isLoggedIn = computed(() => this.auth.currentUser() !== null);

  async ngOnInit(): Promise<void> {
    await this.auth.restoreSession();
  }
}
