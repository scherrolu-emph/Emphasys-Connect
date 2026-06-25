import { Component, computed, input } from '@angular/core';
import type { DisplayPrereqStatus } from '../../core/cases/prereq-display-status.util';

@Component({
  selector: 'app-prereq-status-badge',
  standalone: true,
  templateUrl: './prereq-status-badge.component.html',
  styleUrls: ['./prereq-status-badge.component.scss'],
})
export class PrereqStatusBadgeComponent {
  readonly displayStatus = input.required<DisplayPrereqStatus>();

  readonly label = computed(() => {
    switch (this.displayStatus()) {
      case 'not_ready':              return 'Not Ready';
      case 'pending':                return 'Pending';
      case 'deficiency':             return 'Deficiency';
      case 'submitted_under_review': return 'Submitted - Under Review';
      case 'accepted':               return 'Accepted';
    }
  });

  readonly cssClass = computed(() => {
    switch (this.displayStatus()) {
      case 'not_ready':              return 'badge badge-muted';
      case 'pending':                return 'badge badge-neutral';
      case 'deficiency':             return 'badge badge-danger';
      case 'submitted_under_review': return 'badge badge-caution';
      case 'accepted':               return 'badge badge-success';
    }
  });
}
