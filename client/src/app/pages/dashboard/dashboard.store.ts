import { Injectable, computed, inject, signal } from '@angular/core';
import { CaseService } from '../../core/cases/case.service';
import type { CaseSummary, FilterType } from '../../core/cases/case.models';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly caseService = inject(CaseService);

  readonly cases = signal<CaseSummary[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedType = signal<FilterType>('all');

  readonly filteredCases = computed(() => {
    const type = this.selectedType();
    return type === 'all' ? this.cases() : this.cases().filter(c => c.caseType === type);
  });

  async load(hfaId: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const result = await this.caseService.getHfaCases(hfaId);
      this.cases.set(result);
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Unknown error';
      this.error.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadForDeveloper(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const result = await this.caseService.getParticipantCases();
      this.cases.set(result);
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Unknown error';
      this.error.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectType(type: FilterType): void {
    this.selectedType.set(type);
  }
}
