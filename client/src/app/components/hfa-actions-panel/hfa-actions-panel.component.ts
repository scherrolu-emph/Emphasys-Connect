import { Component, computed, input, output, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { attachOutline, checkmarkOutline, chevronDownOutline } from 'ionicons/icons';
import type { MilestoneDetail } from '../../core/cases/case.models';
import { PrereqStatusBadgeComponent } from '../prereq-status-badge/prereq-status-badge.component';
import { MilestoneStatusBadgeComponent } from '../milestone-status-badge/milestone-status-badge.component';

addIcons({ attachOutline, checkmarkOutline, chevronDownOutline });

export interface AcceptEvent { prereqId: string; prereqTitle: string; milestoneId: string; }
export interface ReturnEvent  { prereqId: string; prereqTitle: string; note: string; }
export interface TriggerEvent { prereqId: string; prereqTitle: string; }

@Component({
  selector: 'app-hfa-actions-panel',
  standalone: true,
  imports: [IonIcon, PrereqStatusBadgeComponent, MilestoneStatusBadgeComponent],
  templateUrl: './hfa-actions-panel.component.html',
  styleUrls: ['./hfa-actions-panel.component.scss'],
})
export class HfaActionsPanelComponent {
  readonly milestones = input<MilestoneDetail[]>([]);

  readonly acceptPrereq   = output<AcceptEvent>();
  readonly returnPrereq   = output<ReturnEvent>();
  readonly triggerRequest = output<TriggerEvent>();

  private readonly userToggledIds = signal<Map<string, boolean>>(new Map());

  readonly expandedMilestoneIds = computed<Set<string>>(() => {
    const toggles = this.userToggledIds();
    const result = new Set<string>();
    for (const m of this.milestones()) {
      const explicit = toggles.get(m.id);
      if (explicit !== undefined ? explicit : m.status === 'active') result.add(m.id);
    }
    return result;
  });

  readonly expandedPrereqId   = signal<string | null>(null);
  readonly returnNotePrereqId = signal<string | null>(null);
  readonly returnNoteText     = signal('');

  toggleMilestone(id: string): void {
    this.userToggledIds.update(map => {
      const next = new Map(map);
      next.set(id, !this.expandedMilestoneIds().has(id));
      return next;
    });
  }

  togglePrereq(id: string): void {
    this.expandedPrereqId.update(cur => (cur === id ? null : id));
    if (this.returnNotePrereqId() !== null) {
      this.returnNotePrereqId.set(null);
      this.returnNoteText.set('');
    }
  }

  openReturnNote(prereqId: string): void {
    this.returnNotePrereqId.set(prereqId);
    this.returnNoteText.set('');
  }

  cancelReturnNote(): void {
    this.returnNotePrereqId.set(null);
    this.returnNoteText.set('');
  }

  confirmReturnNote(prereqId: string, prereqTitle: string): void {
    const note = this.returnNoteText().trim();
    if (!note) return;
    this.returnPrereq.emit({ prereqId, prereqTitle, note });
    this.returnNotePrereqId.set(null);
    this.returnNoteText.set('');
  }
}
