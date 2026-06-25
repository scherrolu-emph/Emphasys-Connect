import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonSkeletonText,
  IonChip,
  ViewWillEnter,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { CaseService } from '../../core/cases/case.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { CaseDetailStore } from './case-detail.store';
import { ParticipantsTabComponent } from '../../components/participants-tab/participants-tab.component';
import { CASE_TYPE_LABELS } from '../../core/cases/case.models';
import type { CaseParticipant } from '../../core/cases/case.models';
import type { AddParticipantRequest } from '../../components/participants-tab/participants-tab.component';

type ActiveTab = 'actions' | 'conversation' | 'participants';
type ActiveRightTab = 'conversation' | 'participants';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  providers: [CaseDetailStore],
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonSegment, IonSegmentButton, IonLabel, IonBadge, IonSkeletonText, IonChip,
    ParticipantsTabComponent,
  ],
  templateUrl: './case-detail.page.html',
  styleUrls: ['./case-detail.page.scss'],
})
export class CaseDetailPage implements ViewWillEnter, ViewWillLeave, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly caseService = inject(CaseService);
  private readonly realtime = inject(RealtimeService);
  readonly store = inject(CaseDetailStore);

  private caseId = '';

  readonly activeTab = signal<ActiveTab>('actions');
  readonly activeRightTab = signal<ActiveRightTab>('conversation');
  readonly lastReadAt = signal<string>(new Date().toISOString());

  readonly isHfa = computed(() => this.auth.isHfa());
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly currentUserHfaId = computed(() => this.auth.hfaId());

  readonly caseTypeLabel = computed(() => {
    const c = this.store.caseDetail();
    return c ? CASE_TYPE_LABELS[c.caseType] : '';
  });

  readonly unreadCount = computed(() => {
    const cutoff = this.lastReadAt();
    return this.store.messages().filter(m => m.createdAt > cutoff).length;
  });

  ionViewWillEnter(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { void this.router.navigate(['/my-cases']); return; }
    this.caseId = id;
    this.lastReadAt.set(new Date().toISOString());
    void this.loadAndSubscribe();
  }

  private async loadAndSubscribe(): Promise<void> {
    await this.store.loadCase(this.caseId);

    const detail = this.store.caseDetail();
    if (!detail) return;

    // Access guard: redirect if not a participant (RLS would also block the query, but handle gracefully)
    const currentId = this.currentUserId();
    if (currentId) {
      const isParticipant = this.store.participants().some(p => p.userId === currentId);
      const isHfaUser = this.isHfa();
      if (!isParticipant && !isHfaUser) {
        void this.router.navigate(['/my-cases']);
        return;
      }
    }

    this.realtime.subscribeToCase(this.caseId, {
      onMessage: payload => {
        if (payload.eventType === 'INSERT' && payload.new) {
          this.store.appendMessage(payload.new as Record<string, unknown>);
        }
      },
      onParticipant: () => {
        this.store.refreshParticipants(this.caseId);
      },
    });
  }

  ionViewWillLeave(): void {
    this.realtime.unsubscribe(this.caseId);
    this.store.reset();
  }

  ngOnDestroy(): void {
    this.realtime.unsubscribe(this.caseId);
  }

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    if (tab === 'conversation') {
      this.lastReadAt.set(new Date().toISOString());
    }
  }

  setRightTab(tab: ActiveRightTab): void {
    this.activeRightTab.set(tab);
    if (tab === 'conversation') {
      this.lastReadAt.set(new Date().toISOString());
    }
  }

  async onAddParticipant(req: AddParticipantRequest): Promise<void> {
    const detail = this.store.caseDetail();
    const userId = this.currentUserId();
    if (!detail || !userId) return;
    try {
      await this.caseService.addParticipant(this.caseId, detail.hfaId, req.email, req.role, userId);
      this.store.refreshParticipants(this.caseId);
    } catch (err) {
      console.error('addParticipant failed', err);
    }
  }

  async onRemoveParticipant(p: CaseParticipant): Promise<void> {
    const detail = this.store.caseDetail();
    const userId = this.currentUserId();
    if (!detail || !userId) return;
    try {
      await this.caseService.removeParticipant(this.caseId, detail.hfaId, p.id, p.email, userId);
      this.store.refreshParticipants(this.caseId);
    } catch (err) {
      console.error('removeParticipant failed', err);
    }
  }
}
