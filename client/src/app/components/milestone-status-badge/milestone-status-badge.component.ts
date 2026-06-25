import { Component, computed, input } from '@angular/core';
import type { MilestoneDetail } from '../../core/cases/case.models';

@Component({
  selector: 'app-milestone-status-badge',
  standalone: true,
  templateUrl: './milestone-status-badge.component.html',
  styleUrls: ['./milestone-status-badge.component.scss'],
})
export class MilestoneStatusBadgeComponent {
  readonly status = input.required<MilestoneDetail['status']>();

  readonly label = computed(() => {
    switch (this.status()) {
      case 'open': return 'Upcoming';
      case 'active': return 'In Progress';
      case 'completed': return 'Complete';
      default: return 'Upcoming';
    }
  });

  readonly cssClass = computed(() => {
    switch (this.status()) {
      case 'open': return 'badge badge-neutral';
      case 'active': return 'badge badge-accent';
      case 'completed': return 'badge badge-success';
      default: return 'badge badge-neutral';
    }
  });
}
