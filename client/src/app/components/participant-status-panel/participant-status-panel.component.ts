import { Component, computed, input, output, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';
import type { MilestoneDetail, PrerequisiteSummary } from '../../core/cases/case.models';
import { getDisplayStatus, type DisplayPrereqStatus } from '../../core/cases/prereq-display-status.util';
import { PrereqStatusBadgeComponent } from '../prereq-status-badge/prereq-status-badge.component';
import { MilestoneStatusBadgeComponent } from '../milestone-status-badge/milestone-status-badge.component';

addIcons({ chevronDownOutline });

@Component({
  selector: 'app-participant-status-panel',
  standalone: true,
  imports: [IonIcon, PrereqStatusBadgeComponent, MilestoneStatusBadgeComponent],
  templateUrl: './participant-status-panel.component.html',
  styleUrls: ['./participant-status-panel.component.scss'],
})
export class ParticipantStatusPanelComponent {
  readonly milestones = input<MilestoneDetail[]>([]);
  readonly markReady = output<string>();

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

  toggleMilestone(id: string): void {
    this.userToggledIds.update(map => {
      const next = new Map(map);
      next.set(id, !this.expandedMilestoneIds().has(id));
      return next;
    });
  }

  onMarkReady(prereqId: string): void {
    this.markReady.emit(prereqId);
  }

  prereqDisplayStatus(prereq: PrerequisiteSummary, milestoneStatus: MilestoneDetail['status']): DisplayPrereqStatus {
    return getDisplayStatus(prereq, milestoneStatus);
  }
}
