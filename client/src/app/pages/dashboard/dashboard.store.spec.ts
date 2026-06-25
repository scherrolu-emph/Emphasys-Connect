import { TestBed } from '@angular/core/testing';
import { DashboardStore } from './dashboard.store';
import { CaseService } from '../../core/cases/case.service';
import type { CaseSummary } from '../../core/cases/case.models';

const makeCase = (id: string, caseType: CaseSummary['caseType'] = 'development_construction'): CaseSummary => ({
  id,
  title: `Case ${id}`,
  caseType,
  activeMilestone: null,
  prereqAccepted: 0,
  prereqTotal: 0,
});

describe('DashboardStore', () => {
  let store: DashboardStore;
  let caseServiceSpy: jasmine.SpyObj<CaseService>;

  beforeEach(() => {
    caseServiceSpy = jasmine.createSpyObj('CaseService', ['getHfaCases']);
    TestBed.configureTestingModule({
      providers: [{ provide: CaseService, useValue: caseServiceSpy }],
    });
    store = TestBed.inject(DashboardStore);
  });

  it('starts with empty cases and isLoading false', () => {
    expect(store.cases()).toEqual([]);
    expect(store.isLoading()).toBeFalse();
  });

  it('load sets cases and clears loading', async () => {
    const cases = [makeCase('c1'), makeCase('c2')];
    caseServiceSpy.getHfaCases.and.returnValue(Promise.resolve(cases));
    await store.load('hfa-1');
    expect(store.cases()).toEqual(cases);
    expect(store.isLoading()).toBeFalse();
  });

  it('load sets error on failure', async () => {
    caseServiceSpy.getHfaCases.and.returnValue(Promise.reject(new Error('Network error')));
    await store.load('hfa-1');
    expect(store.error()).toBe('Network error');
    expect(store.isLoading()).toBeFalse();
  });

  it('filteredCases returns all when selectedType is all', async () => {
    const cases = [makeCase('c1', 'development_construction'), makeCase('c2', 'loan_underwriting')];
    caseServiceSpy.getHfaCases.and.returnValue(Promise.resolve(cases));
    await store.load('hfa-1');
    store.selectType('all');
    expect(store.filteredCases().length).toBe(2);
  });

  it('filteredCases filters by caseType', async () => {
    const cases = [makeCase('c1', 'development_construction'), makeCase('c2', 'loan_underwriting')];
    caseServiceSpy.getHfaCases.and.returnValue(Promise.resolve(cases));
    await store.load('hfa-1');
    store.selectType('loan_underwriting');
    expect(store.filteredCases().length).toBe(1);
    expect(store.filteredCases()[0].id).toBe('c2');
  });

  it('selectType updates selectedType signal', () => {
    store.selectType('bond_issuance');
    expect(store.selectedType()).toBe('bond_issuance');
  });
});
