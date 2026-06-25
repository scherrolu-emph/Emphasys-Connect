import { TestBed } from '@angular/core/testing';
import { CaseService } from './case.service';
import { supabase } from '../supabase/supabase.client';

describe('CaseService', () => {
  let service: CaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('maps raw Supabase row to CaseSummary', async () => {
    const raw = [
      {
        id: 'c1',
        title: 'Park Ave Apartments',
        case_type: 'development_construction',
        milestones: [
          {
            id: 'm1',
            title: 'Pre-Construction',
            status: 'active',
            target_days: 60,
            activated_at: new Date(Date.now() - 70 * 86_400_000).toISOString(),
            prerequisites: [
              { id: 'p1', status: 'accepted' },
              { id: 'p2', status: 'pending_open' },
              { id: 'p3', status: 'pending_open' },
              { id: 'p4', status: 'accepted' },
            ],
          },
          {
            id: 'm2',
            title: 'Construction',
            status: 'open',
            target_days: null,
            activated_at: null,
            prerequisites: [],
          },
        ],
      },
    ];

    const fromSpy = jasmine.createSpyObj('from', ['select']);
    const selectSpy = jasmine.createSpyObj('select', ['eq']);
    const eqSpy = jasmine.createSpyObj('eq', ['order']);
    eqSpy.order.and.returnValue(Promise.resolve({ data: raw, error: null }));
    selectSpy.eq.and.returnValue(eqSpy);
    fromSpy.select.and.returnValue(selectSpy);
    spyOn(supabase, 'from').and.returnValue(fromSpy as any);

    const cases = await service.getHfaCases('hfa-1');

    expect(cases.length).toBe(1);
    const c = cases[0];
    expect(c.id).toBe('c1');
    expect(c.title).toBe('Park Ave Apartments');
    expect(c.caseType).toBe('development_construction');
    expect(c.prereqAccepted).toBe(2);
    expect(c.prereqTotal).toBe(4);
    expect(c.activeMilestone?.title).toBe('Pre-Construction');
  });

  it('sets activeMilestone to null when no active milestone', async () => {
    const raw = [
      {
        id: 'c2',
        title: 'Completed Case',
        case_type: 'loan_underwriting',
        milestones: [
          { id: 'm1', title: 'Step 1', status: 'completed', target_days: null, activated_at: null, prerequisites: [] },
        ],
      },
    ];

    const fromSpy = jasmine.createSpyObj('from', ['select']);
    const selectSpy = jasmine.createSpyObj('select', ['eq']);
    const eqSpy = jasmine.createSpyObj('eq', ['order']);
    eqSpy.order.and.returnValue(Promise.resolve({ data: raw, error: null }));
    selectSpy.eq.and.returnValue(eqSpy);
    fromSpy.select.and.returnValue(selectSpy);
    spyOn(supabase, 'from').and.returnValue(fromSpy as any);

    const cases = await service.getHfaCases('hfa-1');
    expect(cases[0].activeMilestone).toBeNull();
    expect(cases[0].prereqAccepted).toBe(0);
    expect(cases[0].prereqTotal).toBe(0);
  });

  it('throws when Supabase returns an error', async () => {
    const fromSpy = jasmine.createSpyObj('from', ['select']);
    const selectSpy = jasmine.createSpyObj('select', ['eq']);
    const eqSpy = jasmine.createSpyObj('eq', ['order']);
    eqSpy.order.and.returnValue(Promise.resolve({ data: null, error: new Error('DB error') }));
    selectSpy.eq.and.returnValue(eqSpy);
    fromSpy.select.and.returnValue(selectSpy);
    spyOn(supabase, 'from').and.returnValue(fromSpy as any);

    await expectAsync(service.getHfaCases('hfa-1')).toBeRejected();
  });
});
