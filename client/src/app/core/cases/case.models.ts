import type { CaseType } from '../supabase/database.types';

export interface MilestoneSummary {
  id: string;
  title: string;
  status: 'open' | 'active' | 'completed';
  targetDays: number | null;
  activatedAt: string | null;
}

export interface CaseSummary {
  id: string;
  title: string;
  caseType: CaseType;
  activeMilestone: MilestoneSummary | null;
  prereqAccepted: number;
  prereqTotal: number;
}

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  blank: 'General',
  development_construction: 'Construction',
  loan_underwriting: 'Loan',
  bond_issuance: 'Application',
};

export type FilterType = 'all' | CaseType;

export const FILTER_CHIPS: Array<{ value: FilterType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'development_construction', label: 'Construction' },
  { value: 'loan_underwriting', label: 'Loan' },
  { value: 'bond_issuance', label: 'Application' },
];
