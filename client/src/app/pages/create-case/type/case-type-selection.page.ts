import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import type { CaseType } from '../../../core/supabase/database.types';

interface CaseTypeOption {
  value: CaseType;
  label: string;
  description: string;
  routesToSearch: boolean;
}

const CASE_TYPE_OPTIONS: CaseTypeOption[] = [
  {
    value: 'blank',
    label: 'Start blank',
    description: 'No back-office project — set up milestones manually',
    routesToSearch: false,
  },
  {
    value: 'development_construction',
    label: 'Development Construction',
    description: 'Link to an IMC construction project',
    routesToSearch: true,
  },
  {
    value: 'loan_underwriting',
    label: 'Loan Underwriting',
    description: 'Loan underwriting case — back-office integration coming soon',
    routesToSearch: false,
  },
  {
    value: 'bond_issuance',
    label: 'Bond Issuance',
    description: 'Bond issuance case — back-office integration coming soon',
    routesToSearch: false,
  },
];

@Component({
  selector: 'app-case-type-selection',
  templateUrl: './case-type-selection.page.html',
  styleUrls: ['./case-type-selection.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonList, IonItem, IonLabel,
  ],
})
export class CaseTypeSelectionPage {
  private readonly router = inject(Router);

  readonly options = CASE_TYPE_OPTIONS;

  selectType(option: CaseTypeOption): void {
    if (option.routesToSearch) {
      this.router.navigate(['/create-case/search'], {
        state: { caseType: option.value },
      });
    } else {
      this.router.navigate(['/create-case/confirm'], {
        state: { caseType: option.value },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
