import { Injectable } from '@angular/core';
import { supabase } from '../supabase/supabase.client';
import type { ActivityItem } from './activity.model';

interface RawParticipation {
  case_id: string;
  cases: { id: string; title: string } | null;
}

interface RawActivityMessage {
  id: string;
  type: 'system' | 'message';
  content: string;
  author_id: string | null;
  case_id: string;
  created_at: string;
}

interface RawProfile {
  id: string;
  display_name: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  async getActivity(userId: string): Promise<ActivityItem[]> {
    const { data: parts, error: partErr } = await supabase
      .from('case_participants')
      .select('case_id, cases(id, title)')
      .eq('user_id', userId);
    if (partErr) throw partErr;

    const participations = (parts as unknown as RawParticipation[]);
    if (!participations.length) return [];

    const caseIds = participations.map(p => p.case_id);
    const caseNameMap = new Map(
      participations.map(p => [p.case_id, p.cases?.title ?? 'Unknown Case'])
    );

    const { data: msgs, error: msgErr } = await supabase
      .from('conversation_messages')
      .select('id, type, content, author_id, case_id, created_at')
      .in('case_id', caseIds)
      .order('created_at', { ascending: false })
      .limit(50);
    if (msgErr) throw msgErr;

    const messages = (msgs as unknown as RawActivityMessage[]);

    const authorIds = [
      ...new Set(messages.filter(m => m.type === 'message' && m.author_id).map(m => m.author_id!)),
    ];
    const authorNameMap = new Map<string, string>();
    if (authorIds.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', authorIds);
      (profiles as unknown as RawProfile[]).forEach(p => authorNameMap.set(p.id, p.display_name));
    }

    return messages.map(m => ({
      messageId: m.id,
      body: m.content,
      messageType: m.type === 'system' ? 'system' : 'manual',
      authorName: m.author_id ? (authorNameMap.get(m.author_id) ?? undefined) : undefined,
      caseId: m.case_id,
      caseName: caseNameMap.get(m.case_id) ?? 'Unknown Case',
      createdAt: m.created_at,
    }));
  }
}
