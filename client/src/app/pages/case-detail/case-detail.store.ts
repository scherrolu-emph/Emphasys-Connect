import { Injectable, computed, inject, signal } from '@angular/core';
import { CaseService } from '../../core/cases/case.service';
import type { CaseDetail, CaseParticipant, ConversationMessage, MilestoneDetail, PrerequisiteSummary } from '../../core/cases/case.models';

@Injectable()
export class CaseDetailStore {
  private readonly caseService = inject(CaseService);

  readonly caseDetail = signal<CaseDetail | null>(null);
  readonly participants = signal<CaseParticipant[]>([]);
  readonly messages = signal<ConversationMessage[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly milestones = computed(() => this.caseDetail()?.milestones ?? []);
  readonly activeMilestone = computed(() => this.caseDetail()?.activeMilestone ?? null);

  async loadCase(caseId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [detail, participants, messages] = await Promise.all([
        this.caseService.getCaseDetail(caseId),
        this.caseService.getParticipants(caseId),
        this.caseService.getMessages(caseId),
      ]);
      this.caseDetail.set(detail);
      this.participants.set(participants);
      this.messages.set(messages);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load case');
    } finally {
      this.loading.set(false);
    }
  }

  appendMessage(raw: Record<string, unknown>): void {
    const msg: ConversationMessage = {
      id: raw['id'] as string,
      hfaId: raw['hfa_id'] as string,
      caseId: raw['case_id'] as string,
      authorId: (raw['author_id'] as string | null) ?? null,
      type: raw['type'] as 'system' | 'message',
      content: raw['content'] as string,
      createdAt: raw['created_at'] as string,
    };
    // Guard: skip if already present (e.g. optimistic send already inserted this id)
    this.messages.update(prev =>
      prev.some(m => m.id === msg.id) ? prev : [...prev, msg],
    );
  }

  refreshParticipants(caseId: string): void {
    void this.caseService.getParticipants(caseId).then(list => this.participants.set(list));
  }

  applyPrereqUpdate(prereqId: string, changes: Partial<PrerequisiteSummary>): void {
    const detail = this.caseDetail();
    if (!detail) return;
    const milestones = detail.milestones.map(m => ({
      ...m,
      prerequisites: m.prerequisites.map(p => p.id === prereqId ? { ...p, ...changes } : p),
    }));
    this.caseDetail.set({
      ...detail,
      milestones,
      activeMilestone: milestones.find(m => m.status === 'active') ?? null,
    });
  }

  applyMilestoneUpdate(milestoneId: string, changes: Partial<MilestoneDetail>): void {
    const detail = this.caseDetail();
    if (!detail) return;
    const milestones = detail.milestones.map(m => m.id === milestoneId ? { ...m, ...changes } : m);
    this.caseDetail.set({
      ...detail,
      milestones,
      activeMilestone: milestones.find(m => m.status === 'active') ?? null,
    });
  }

  reset(): void {
    this.caseDetail.set(null);
    this.participants.set([]);
    this.messages.set([]);
    this.loading.set(false);
    this.error.set(null);
  }
}
