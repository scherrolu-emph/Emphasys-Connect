import { Component, computed, input, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { attachOutline, checkmarkOutline, chevronDownOutline } from 'ionicons/icons';
import type { MilestoneDetail } from '../../core/cases/case.models';
import { PrereqStatusBadgeComponent } from '../prereq-status-badge/prereq-status-badge.component';

addIcons({ attachOutline, checkmarkOutline, chevronDownOutline });

@Component({
  selector: 'app-hfa-actions-panel',
  standalone: true,
  imports: [IonIcon, PrereqStatusBadgeComponent],
  templateUrl: './hfa-actions-panel.component.html',
  styleUrls: ['./hfa-actions-panel.component.scss'],
})
export class HfaActionsPanelComponent {
  readonly milestones = input<MilestoneDetail[]>([]);

  readonly expandedPrereqId = signal<string | null>(null);

  readonly activeMilestone = computed(() =>
    this.milestones().find(m => m.status === 'active') ?? null,
  );

  readonly allComplete = computed(() =>
    this.milestones().length > 0 && this.milestones().every(m => m.status === 'completed'),
  );

  togglePrereq(id: string): void {
    this.expandedPrereqId.update(cur => (cur === id ? null : id));
  }
}
