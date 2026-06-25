import { Injectable } from '@angular/core';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase.client';

export interface CaseRealtimeCallbacks {
  onMessage?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onParticipant?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onPrerequisite?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onMilestone?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private channels = new Map<string, RealtimeChannel>();

  subscribeToCase(caseId: string, callbacks: CaseRealtimeCallbacks = {}): RealtimeChannel {
    const existing = this.channels.get(caseId);
    if (existing) return existing;

    const channel = supabase
      .channel(`case:${caseId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_messages', filter: `case_id=eq.${caseId}` },
        payload => callbacks.onMessage?.(payload),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'case_participants', filter: `case_id=eq.${caseId}` },
        payload => callbacks.onParticipant?.(payload),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prerequisites', filter: `case_id=eq.${caseId}` },
        payload => callbacks.onPrerequisite?.(payload),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'milestones', filter: `case_id=eq.${caseId}` },
        payload => callbacks.onMilestone?.(payload),
      )
      .subscribe();

    this.channels.set(caseId, channel);
    return channel;
  }

  unsubscribe(caseId: string): void {
    const channel = this.channels.get(caseId);
    if (!channel) return;
    channel.unsubscribe();
    this.channels.delete(caseId);
  }

  subscribeToPrereqChanges(caseIds: string[], callback: () => void): void {
    for (const caseId of caseIds) {
      const key = `tasks:${caseId}`;
      if (this.channels.has(key)) continue;

      const channel = supabase
        .channel(`prereq-tasks:${caseId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'prerequisites', filter: `case_id=eq.${caseId}` },
          () => callback(),
        )
        .subscribe();

      this.channels.set(key, channel);
    }
  }

  unsubscribePrereqChanges(caseIds: string[]): void {
    for (const caseId of caseIds) {
      const key = `tasks:${caseId}`;
      const channel = this.channels.get(key);
      if (!channel) continue;
      channel.unsubscribe();
      this.channels.delete(key);
    }
  }
}
