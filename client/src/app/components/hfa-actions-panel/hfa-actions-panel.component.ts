import { Component, computed, input, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { attachOutline, checkmarkOutline, chevronDownOutline } from 'ionicons/icons';
import type { MilestoneDetail } from '../../core/cases/case.models';
import { PrereqStatusBadgeComponent } from '../prereq-status-badge/prereq-status-badge.component';
import { MilestoneStatusBadgeComponent } from '../milestone-status-badge/milestone-status-badge.component';

addIcons({ attachOutline, checkmarkOutline, chevronDownOutline });

@Component({
  selector: 'app-hfa-actions-panel',
  standalone: true,
  imports: [IonIcon, PrereqStatusBadgeComponent, MilestoneStatusBadgeComponent],
  templateUrl: './hfa-actions-panel.component.html',
  styleUrls: ['./hfa-actions-panel.component.scss'],
})
export class HfaActionsPanelComponent {
  readonly milestones = input<MilestoneDetail[]>([]);

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

  readonly expandedPrereqId = signal<string | null>(null);

  toggleMilestone(id: string): void {
    this.userToggledIds.update(map => {
      const next = new Map(map);
      next.set(id, !this.expandedMilestoneIds().has(id));
      return next;
    });
  }

  togglePrereq(id: string): void {
    this.expandedPrereqId.update(cur => (cur === id ? null : id));
  }
}
