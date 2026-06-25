import { Component, computed, input, output } from '@angular/core';
import {
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';
import type { CaseSummary } from '../../../core/cases/case.models';
import { CASE_TYPE_LABELS } from '../../../core/cases/case.models';
import { isOverdue } from '../../../core/cases/overdue.utils';

@Component({
  selector: 'app-case-card',
  templateUrl: './case-card.component.html',
  styleUrls: ['./case-card.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonBadge, IonIcon],
})
export class CaseCardComponent {
  readonly caseItem = input.required<CaseSummary>();
  readonly selected = output<string>();

  readonly overdue = computed(() => isOverdue(this.caseItem().activeMilestone));
  readonly typeLabel = computed(() => CASE_TYPE_LABELS[this.caseItem().caseType]);
  readonly milestoneName = computed(
    () => this.caseItem().activeMilestone?.title ?? 'Completed'
  );
  readonly progressPercent = computed(() => {
    const { prereqAccepted, prereqTotal } = this.caseItem();
    return prereqTotal > 0 ? Math.round((prereqAccepted / prereqTotal) * 100) : 0;
  });

  constructor() {
    addIcons({ chevronForwardOutline });
  }
}
