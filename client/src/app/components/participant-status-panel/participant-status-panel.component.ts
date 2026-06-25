import { Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { attachOutline, checkmarkOutline } from 'ionicons/icons';
import type { MilestoneDetail } from '../../core/cases/case.models';
import { PrereqStatusBadgeComponent } from '../prereq-status-badge/prereq-status-badge.component';
import { MilestoneStatusBadgeComponent } from '../milestone-status-badge/milestone-status-badge.component';

addIcons({ attachOutline, checkmarkOutline });

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

  onMarkReady(prereqId: string): void {
    this.markReady.emit(prereqId);
  }
}
