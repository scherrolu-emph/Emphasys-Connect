import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { CaseService } from '../../../core/cases/case.service';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardStore } from '../../dashboard/dashboard.store';
import type { CreateCasePayload } from '../../../core/cases/import.models';

@Component({
  selector: 'app-create-case-action',
  templateUrl: './create-case-action.page.html',
  styleUrls: ['./create-case-action.page.scss'],
  standalone: true,
  imports: [IonContent, IonSpinner],
})
export class CreateCaseActionPage implements OnInit {
  private readonly router = inject(Router);
  private readonly caseService = inject(CaseService);
  private readonly auth = inject(AuthService);
  private readonly dashboardStore = inject(DashboardStore);
  private readonly toastCtrl = inject(ToastController);

  ngOnInit(): void {
    const state = this.router.getCurrentNavigation()?.extras.state as { payload?: CreateCasePayload } | undefined
      ?? (history.state as { payload?: CreateCasePayload } | undefined);

    if (!state?.payload) {
      this.router.navigate(['/create-case/type'], { replaceUrl: true });
      return;
    }
    void this.execute(state.payload);
  }

  private async execute(payload: CreateCasePayload): Promise<void> {
    const hfaId = this.auth.hfaId();
    const userId = this.auth.currentUser()?.id;

    if (!hfaId || !userId) {
      await this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    try {
      const caseId = await this.caseService.createCase(payload, hfaId, userId);
      // Reload dashboard so new case appears
      void this.dashboardStore.load(hfaId);
      await this.router.navigate(['/cases', caseId], { replaceUrl: true });
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Creation failed — please try again';
      const toast = await this.toastCtrl.create({
        message: msg,
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
      await toast.present();
      // Return to confirm screen
      this.router.navigate(['/create-case/confirm'], {
        state: payload,
        replaceUrl: true,
      });
    }
  }
}
