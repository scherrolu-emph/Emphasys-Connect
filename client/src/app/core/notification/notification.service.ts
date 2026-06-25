import { Injectable, computed, effect, inject, signal } from '@angular/core';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase.client';
import { AuthService } from '../auth/auth.service';
import type { NotificationType } from '../supabase/database.types';
import type { AppNotification, OverdueItem } from './notification.model';

interface RawNotification {
  id: string;
  hfa_id: string;
  user_id: string;
  case_id: string | null;
  type: NotificationType;
  title: string;
  body: string;
  prereq_id: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

interface RawOverdueMilestone {
  id: string;
  title: string;
  case_id: string;
  target_days: number;
  activated_at: string;
  cases: { id: string; title: string };
}

function mapNotification(raw: RawNotification): AppNotification {
  return {
    id: raw.id,
    hfaId: raw.hfa_id,
    userId: raw.user_id,
    caseId: raw.case_id,
    type: raw.type,
    title: raw.title,
    body: raw.body,
    prereqId: raw.prereq_id,
    read: raw.read,
    readAt: raw.read_at,
    createdAt: raw.created_at,
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly auth = inject(AuthService);

  readonly notifications = signal<AppNotification[]>([]);
  readonly overdueItems = signal<OverdueItem[]>([]);

  readonly unreadCount = computed(() => this.notifications().filter(n => !n.read).length);
  readonly overdueCount = computed(() => this.overdueItems().length);
  readonly totalBadge = computed(() => this.unreadCount() + this.overdueCount());

  private notifChannel: RealtimeChannel | null = null;

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        void this.loadNotifications(user.id);
        this.subscribeToNotifications(user.id);
        void this.loadOverdueItems();
      } else {
        this.notifications.set([]);
        this.overdueItems.set([]);
        this.notifChannel?.unsubscribe();
        this.notifChannel = null;
      }
    });
  }

  async writeNotification(
    hfaId: string,
    userId: string,
    caseId: string | null,
    type: NotificationType,
    title: string,
    body: string,
    prereqId?: string | null,
  ): Promise<void> {
    await supabase.from('notifications').insert({
      hfa_id: hfaId,
      user_id: userId,
      case_id: caseId,
      type,
      title,
      body,
      prereq_id: prereqId ?? null,
    });
  }

  async markAllRead(): Promise<void> {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    const now = new Date().toISOString();
    await supabase
      .from('notifications')
      .update({ read: true, read_at: now })
      .eq('user_id', userId)
      .eq('read', false);
    this.notifications.update(prev =>
      prev.map(n => ({ ...n, read: true, readAt: now })),
    );
  }

  private async loadNotifications(userId: string): Promise<void> {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      this.notifications.set((data as unknown as RawNotification[]).map(mapNotification));
    }
  }

  private subscribeToNotifications(userId: string): void {
    this.notifChannel?.unsubscribe();
    this.notifChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          const notif = mapNotification(payload.new as unknown as RawNotification);
          this.notifications.update(prev =>
            prev.some(n => n.id === notif.id) ? prev : [notif, ...prev],
          );
        },
      )
      .subscribe();
  }

  private async loadOverdueItems(): Promise<void> {
    const { data } = await supabase
      .from('milestones')
      .select('id, title, case_id, target_days, activated_at, cases!inner(id, title)')
      .eq('status', 'active')
      .not('target_days', 'is', null)
      .not('activated_at', 'is', null);

    if (!data) return;
    const now = Date.now();
    const items: OverdueItem[] = (data as unknown as RawOverdueMilestone[])
      .filter(row => {
        const deadline = new Date(row.activated_at).getTime() + row.target_days * 86_400_000;
        return deadline < now;
      })
      .map(row => {
        const deadline = new Date(row.activated_at).getTime() + row.target_days * 86_400_000;
        return {
          caseId: row.case_id,
          caseTitle: row.cases.title,
          milestoneId: row.id,
          milestoneName: row.title,
          daysOverdue: Math.floor((now - deadline) / 86_400_000),
        };
      });
    this.overdueItems.set(items);
  }
}
