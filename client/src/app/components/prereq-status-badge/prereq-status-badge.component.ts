import { Component, computed, input } from '@angular/core';
import type { PrerequisiteSummary } from '../../core/cases/case.models';

@Component({
  selector: 'app-prereq-status-badge',
  standalone: true,
  templateUrl: './prereq-status-badge.component.html',
  styleUrls: ['./prereq-status-badge.component.scss'],
})
export class PrereqStatusBadgeComponent {
  readonly status = input.required<PrerequisiteSummary['status']>();

  readonly label = computed(() => {
    switch (this.status()) {
      case 'pending_open': return 'Pending';
      case 'received_processing': return 'Received — Under Review';
      case 'accepted': return 'Accepted';
      default: return 'Pending';
    }
  });

  readonly cssClass = computed(() => {
    switch (this.status()) {
      case 'pending_open': return 'badge badge-neutral';
      case 'received_processing': return 'badge badge-caution';
      case 'accepted': return 'badge badge-success';
      default: return 'badge badge-neutral';
    }
  });
}
