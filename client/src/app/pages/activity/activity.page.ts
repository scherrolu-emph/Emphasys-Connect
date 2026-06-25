import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flashOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { ActivityService } from '../../core/activity/activity.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component';
import type { ActivityItem } from '../../core/activity/activity.model';
import { timeAgo } from '../../core/activity/activity.model';

interface ActivityGroup {
  caseId: string;
  caseName: string;
  latestAt: string;
  events: ActivityItem[];
}

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    IonButtons, IonContent, IonHeader, IonTitle, IonToolbar,
    IonList, IonListHeader, IonItem, IonLabel, IonSkeletonText, IonIcon,
    NotificationBellComponent,
  ],
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly activitySvc = inject(ActivityService);
  private readonly realtimeSvc = inject(RealtimeService);
  private readonly router = inject(Router);

  readonly activities = signal<ActivityItem[]>([]);
  readonly isLoading = signal(true);
  readonly skeletonRows = [1, 2, 3, 4, 5];

  readonly activityGroups = computed<ActivityGroup[]>(() => {
    const groupMap = new Map<string, ActivityGroup>();
    for (const item of this.activities()) {
      const grp = groupMap.get(item.caseId);
      if (grp) {
        grp.events.push(item);
      } else {
        groupMap.set(item.caseId, {
          caseId: item.caseId,
          caseName: item.caseName,
          latestAt: item.createdAt,
          events: [item],
        });
      }
    }
    return [...groupMap.values()].sort((a, b) => b.latestAt.localeCompare(a.latestAt));
  });

  private subscribedCaseIds: string[] = [];

  constructor() {
    addIcons({ flashOutline });
  }

  async ngOnInit(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;

    try {
      const items = await this.activitySvc.getActivity(user.id);
      this.activities.set(items);

      const caseIds = [...new Set(items.map(i => i.caseId))];
      this.subscribedCaseIds = caseIds;
      const caseNameMap = new Map(items.map(i => [i.caseId, i.caseName]));

      for (const caseId of caseIds) {
        this.realtimeSvc.subscribeToCase(caseId, {
          onMessage: payload => {
            if (payload.eventType !== 'INSERT' || !payload.new) return;
            const raw = payload.new as Record<string, unknown>;
            const newItem: ActivityItem = {
              messageId: raw['id'] as string,
              body: raw['content'] as string,
              messageType: raw['type'] === 'system' ? 'system' : 'manual',
              caseId: raw['case_id'] as string,
              caseName: caseNameMap.get(raw['case_id'] as string) ?? 'Unknown',
              createdAt: raw['created_at'] as string,
            };
            this.activities.update(prev => [newItem, ...prev]);
          },
        });
      }
    } catch (err) {
      console.error('Failed to load activity feed', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    for (const caseId of this.subscribedCaseIds) {
      this.realtimeSvc.unsubscribe(caseId);
    }
  }

  navigateToCase(caseId: string): void {
    void this.router.navigate(['/cases', caseId]);
  }

  readonly timeAgo = timeAgo;
}
