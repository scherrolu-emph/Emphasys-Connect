import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { TaskService } from '../../core/tasks/task.service';
import { TaskBadgeService } from '../../core/tasks/task-badge.service';
import type { MyTask } from '../../core/tasks/task.models';

@Component({
  selector: 'app-my-tasks',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>My Tasks</ion-title>
        <ion-buttons slot="end">
          <app-notification-bell />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (isLoading()) {
        <ion-list>
          @for (row of skeletonRows; track row) {
            <ion-item lines="full">
              <ion-label>
                <ion-skeleton-text animated style="width: 65%"></ion-skeleton-text>
                <ion-skeleton-text animated style="width: 45%; margin-top: 0.5rem"></ion-skeleton-text>
                <ion-skeleton-text animated style="width: 35%; margin-top: 0.25rem"></ion-skeleton-text>
              </ion-label>
            </ion-item>
          }
        </ion-list>
      } @else if (tasks().length === 0) {
        <div class="empty-state">
          <ion-icon name="checkmark-circle-outline" class="empty-icon"></ion-icon>
          <p>No active tasks — check back when your next milestone opens</p>
        </div>
      } @else {
        <ion-list>
          @for (task of tasks(); track task.prereqId) {
            <ion-item button detail lines="full" (click)="navigateToCase(task.caseId)">
              <ion-label>
                <h3>{{ task.prereqTitle }}</h3>
                <p>{{ task.caseTitle }}</p>
                <p class="milestone-name">{{ task.milestoneName }}</p>
              </ion-label>
              <ion-badge slot="end" [color]="task.status === 'received_processing' ? 'warning' : 'primary'">
                {{ task.status === 'received_processing' ? 'Under Review' : 'Pending' }}
              </ion-badge>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonButtons, IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonItem, IonLabel, IonBadge, IonIcon, IonSkeletonText,
    NotificationBellComponent,
  ],
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: var(--ion-color-medium);
      text-align: center;
    }
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .milestone-name {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
    }
  `],
})
export class MyTasksPage implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly taskService = inject(TaskService);
  private readonly taskBadge = inject(TaskBadgeService);
  private readonly realtimeService = inject(RealtimeService);
  private readonly router = inject(Router);

  readonly tasks = signal<MyTask[]>([]);
  readonly isLoading = signal(true);
  readonly skeletonRows = [1, 2, 3, 4];

  readonly taskCount = computed(() => this.tasks().length);

  private caseIds: string[] = [];
  private realtimeSubscribed = false;

  constructor() {
    addIcons({ checkmarkCircleOutline });
  }

  async ngOnInit(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    await this.loadTasks(user.id);

    if (this.caseIds.length > 0 && !this.realtimeSubscribed) {
      this.realtimeSubscribed = true;
      this.realtimeService.subscribeToPrereqChanges(this.caseIds, () => {
        const u = this.auth.currentUser();
        if (u) this.loadTasks(u.id);
      });
    }
  }

  ngOnDestroy(): void {
    this.realtimeService.unsubscribePrereqChanges(this.caseIds);
    this.realtimeSubscribed = false;
  }

  navigateToCase(caseId: string): void {
    this.router.navigate(['/cases', caseId]);
  }

  private async loadTasks(userId: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const myTasks = await this.taskService.getMyTasks(
        userId,
        this.auth.isHfa(),
        this.auth.hfaId(),
      );
      this.tasks.set(myTasks);
      this.taskBadge.count.set(myTasks.length);
      this.caseIds = [...new Set(myTasks.map(t => t.caseId))];
    } catch (err) {
      console.error('MyTasksPage: failed to load tasks', err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
