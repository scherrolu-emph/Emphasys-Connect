import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { supabase } from '../supabase/supabase.client';

type QueryResult = { data: unknown[] | null; error: unknown };

function makeQueryBuilder(result: QueryResult) {
  const resolved = Promise.resolve(result);
  const eqFn = jasmine.createSpy('eq').and.returnValue(resolved);
  const inFn = jasmine.createSpy('in').and.callFake(() =>
    Object.assign(Promise.resolve(result), { eq: eqFn }),
  );
  const selectFn = jasmine.createSpy('select').and.returnValue({ eq: eqFn, in: inFn });
  return { select: selectFn };
}

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TaskService] });
    service = TestBed.inject(TaskService);
  });

  describe('getMyTasks — participant', () => {
    it('returns empty array when user has no case participations', async () => {
      spyOn(supabase, 'from').and.returnValue(makeQueryBuilder({ data: [], error: null }) as any);

      const result = await service.getMyTasks('user-1', false, null);

      expect(result).toEqual([]);
    });

    it('returns empty array when no pending_open prereqs exist', async () => {
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'case_participants') {
          return makeQueryBuilder({ data: [{ case_id: 'case-1' }], error: null }) as any;
        }
        return makeQueryBuilder({ data: [], error: null }) as any;
      });

      const result = await service.getMyTasks('user-1', false, null);

      expect(result).toEqual([]);
    });

    it('maps prereqs to MyTask with case and milestone context', async () => {
      const participantData = [{ case_id: 'case-1' }];
      const prereqData = [{
        id: 'pr-1', title: 'Submit Plans', type: 'document_submission',
        status: 'pending_open', case_id: 'case-1', milestone_id: 'ms-1',
      }];
      const milestoneData = [{ id: 'ms-1', title: 'Foundation' }];
      const caseData = [{ id: 'case-1', title: 'River Commons' }];

      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'case_participants') {
          return makeQueryBuilder({ data: participantData, error: null }) as any;
        }
        if (table === 'prerequisites') {
          return makeQueryBuilder({ data: prereqData, error: null }) as any;
        }
        if (table === 'milestones') {
          return makeQueryBuilder({ data: milestoneData, error: null }) as any;
        }
        return makeQueryBuilder({ data: caseData, error: null }) as any;
      });

      const result = await service.getMyTasks('user-1', false, null);

      expect(result.length).toBe(1);
      expect(result[0]).toEqual(jasmine.objectContaining({
        prereqId: 'pr-1',
        prereqTitle: 'Submit Plans',
        status: 'pending_open',
        caseId: 'case-1',
        caseTitle: 'River Commons',
        milestoneId: 'ms-1',
        milestoneName: 'Foundation',
      }));
    });

    it('throws when the case_participants query fails', async () => {
      const eqFn = jasmine.createSpy('eq').and.returnValue(
        Promise.resolve({ data: null, error: new Error('DB error') }),
      );
      const selectFn = jasmine.createSpy('select').and.returnValue({ eq: eqFn });
      spyOn(supabase, 'from').and.returnValue({ select: selectFn } as any);

      await expectAsync(service.getMyTasks('user-1', false, null)).toBeRejected();
    });
  });

  describe('getMyTasks — HFA', () => {
    it('returns empty array when hfaId is null', async () => {
      const result = await service.getMyTasks('hfa-user-1', true, null);

      expect(result).toEqual([]);
    });

    it('maps received_processing prereqs for HFA', async () => {
      const hfaCaseRows = [{ id: 'case-2' }];
      const prereqData = [{
        id: 'pr-2', title: 'Review Contract', type: 'acceptance_comment',
        status: 'received_processing', case_id: 'case-2', milestone_id: 'ms-2',
      }];
      const milestoneData = [{ id: 'ms-2', title: 'Pre-Construction' }];
      const caseDetailData = [{ id: 'case-2', title: 'Oak Street Lofts' }];

      let casesCallCount = 0;
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'cases') {
          casesCallCount++;
          const data = casesCallCount === 1 ? hfaCaseRows : caseDetailData;
          return makeQueryBuilder({ data, error: null }) as any;
        }
        if (table === 'prerequisites') {
          return makeQueryBuilder({ data: prereqData, error: null }) as any;
        }
        if (table === 'milestones') {
          return makeQueryBuilder({ data: milestoneData, error: null }) as any;
        }
        return makeQueryBuilder({ data: [], error: null }) as any;
      });

      const result = await service.getMyTasks('hfa-user-1', true, 'hfa-abc');

      expect(result.length).toBe(1);
      expect(result[0].status).toBe('received_processing');
      expect(result[0].caseTitle).toBe('Oak Street Lofts');
      expect(result[0].milestoneName).toBe('Pre-Construction');
    });
  });
});
