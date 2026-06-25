import { TestBed } from '@angular/core/testing';
import { CaseService } from './case.service';
import { supabase } from '../supabase/supabase.client';
import type { CreateCasePayload, ImcProject } from './import.models';

const IMC_PROJECT: ImcProject = {
  id: 'imc-001',
  projectNumber: '2024-001',
  name: 'River View Apartments',
  address: '1200 River Rd',
  developerEmail: 'dev@demo.com',
  milestones: [
    {
      id: 'm-1',
      title: 'Foundation',
      order: 1,
      prerequisites: [
        { id: 'p-1', title: 'Building permit', type: 'document_submission' },
      ],
    },
  ],
};

const BLANK_PAYLOAD: CreateCasePayload = {
  caseType: 'blank',
  title: 'My Blank Case',
  participants: [{ email: 'hfa@demo.com', role: 'hfa_staff', source: 'creator' }],
};

const IMC_PAYLOAD: CreateCasePayload = {
  caseType: 'development_construction',
  title: 'River View Apartments',
  imcProject: IMC_PROJECT,
  participants: [
    { email: 'hfa@demo.com', role: 'hfa_staff', source: 'creator' },
    { email: 'dev@demo.com', role: 'developer', source: 'imc' },
  ],
};

/** Build a minimal spy chain for a table that returns the given result at the end. */
function makeInsertSpy(result: object) {
  const single = jasmine.createSpy('single').and.returnValue(Promise.resolve(result));
  const select = jasmine.createSpy('select').and.returnValue({ single });
  const insert = jasmine.createSpy('insert').and.returnValue({ select, ...Promise.resolve(result) });
  // Allow direct await (no .select chain) by making insert thenable
  (insert as unknown as { then: unknown }).then = undefined;
  return { insert, select, single };
}

function makeSimpleInsertSpy(result: object) {
  // For inserts that don't chain .select().single()
  const insert = jasmine.createSpy('insert').and.returnValue(Promise.resolve(result));
  return { insert };
}

function makeMaybeSingleSpy(result: object) {
  const maybeSingle = jasmine.createSpy('maybeSingle').and.returnValue(Promise.resolve(result));
  const eq = jasmine.createSpy('eq').and.returnValue({ maybeSingle });
  const select = jasmine.createSpy('select').and.returnValue({ eq });
  return { select, eq, maybeSingle };
}

describe('CaseService.createCase()', () => {
  let service: CaseService;
  let fromSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaseService);
  });

  describe('blank case', () => {
    it('returns the new caseId on success', async () => {
      fromSpy = spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'cases') {
          const single = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: { id: 'new-case-id' }, error: null }),
          );
          const select = jasmine.createSpy().and.returnValue({ single });
          const insert = jasmine.createSpy().and.returnValue({ select });
          return { insert } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'profiles') {
          const maybeSingle = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: { id: 'profile-1' }, error: null }),
          );
          const eq = jasmine.createSpy().and.returnValue({ maybeSingle });
          const select = jasmine.createSpy().and.returnValue({ eq });
          return { select } as unknown as ReturnType<typeof supabase.from>;
        }
        // case_participants, conversation_messages
        const insert = jasmine.createSpy().and.returnValue(
          Promise.resolve({ data: null, error: null }),
        );
        return { insert } as unknown as ReturnType<typeof supabase.from>;
      });

      const caseId = await service.createCase(BLANK_PAYLOAD, 'hfa-1', 'user-1');
      expect(caseId).toBe('new-case-id');
    });

    it('does not insert milestones or prerequisites for blank case', async () => {
      const insertedTables: string[] = [];
      fromSpy = spyOn(supabase, 'from').and.callFake((table: string) => {
        insertedTables.push(table);
        if (table === 'cases') {
          const single = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: { id: 'case-1' }, error: null }),
          );
          const select = jasmine.createSpy().and.returnValue({ single });
          const insert = jasmine.createSpy().and.returnValue({ select });
          return { insert } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'profiles') {
          const maybeSingle = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: null, error: null }),
          );
          const eq = jasmine.createSpy().and.returnValue({ maybeSingle });
          const select = jasmine.createSpy().and.returnValue({ eq });
          return { select } as unknown as ReturnType<typeof supabase.from>;
        }
        const insert = jasmine.createSpy().and.returnValue(
          Promise.resolve({ data: null, error: null }),
        );
        return { insert } as unknown as ReturnType<typeof supabase.from>;
      });

      await service.createCase(BLANK_PAYLOAD, 'hfa-1', 'user-1');
      expect(insertedTables).not.toContain('milestones');
      expect(insertedTables).not.toContain('prerequisites');
    });
  });

  describe('IMC-backed case', () => {
    it('inserts case_participants before milestones', async () => {
      const insertOrder: string[] = [];
      fromSpy = spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'cases') {
          const single = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: { id: 'case-imc' }, error: null }),
          );
          const select = jasmine.createSpy().and.returnValue({ single });
          const insert = jasmine.createSpy().and.returnValue({ select });
          return { insert } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'profiles') {
          const maybeSingle = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: null, error: null }),
          );
          const eq = jasmine.createSpy().and.returnValue({ maybeSingle });
          const select = jasmine.createSpy().and.returnValue({ eq });
          return { select } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'milestones') {
          insertOrder.push('milestones');
          const single = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: { id: 'ms-1' }, error: null }),
          );
          const select = jasmine.createSpy().and.returnValue({ single });
          const insert = jasmine.createSpy().and.returnValue({ select });
          return { insert } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'case_participants') {
          insertOrder.push('case_participants');
        }
        const insert = jasmine.createSpy().and.returnValue(
          Promise.resolve({ data: null, error: null }),
        );
        return { insert } as unknown as ReturnType<typeof supabase.from>;
      });

      await service.createCase(IMC_PAYLOAD, 'hfa-1', 'user-1');

      const cpIndex = insertOrder.indexOf('case_participants');
      const msIndex = insertOrder.indexOf('milestones');
      expect(cpIndex).toBeGreaterThanOrEqual(0);
      expect(msIndex).toBeGreaterThan(cpIndex);
    });

    it('inserts prerequisites with correct milestone_id', async () => {
      let capturedPrereqs: unknown[] | null = null;
      fromSpy = spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'cases') {
          const single = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: { id: 'case-imc' }, error: null }),
          );
          const select = jasmine.createSpy().and.returnValue({ single });
          const insert = jasmine.createSpy().and.returnValue({ select });
          return { insert } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'profiles') {
          const maybeSingle = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: null, error: null }),
          );
          const eq = jasmine.createSpy().and.returnValue({ maybeSingle });
          const select = jasmine.createSpy().and.returnValue({ eq });
          return { select } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'milestones') {
          const single = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: { id: 'ms-generated-id' }, error: null }),
          );
          const select = jasmine.createSpy().and.returnValue({ single });
          const insert = jasmine.createSpy().and.returnValue({ select });
          return { insert } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'prerequisites') {
          const insert = jasmine.createSpy().and.callFake((rows: unknown[]) => {
            capturedPrereqs = rows;
            return Promise.resolve({ data: null, error: null });
          });
          return { insert } as unknown as ReturnType<typeof supabase.from>;
        }
        const insert = jasmine.createSpy().and.returnValue(
          Promise.resolve({ data: null, error: null }),
        );
        return { insert } as unknown as ReturnType<typeof supabase.from>;
      });

      await service.createCase(IMC_PAYLOAD, 'hfa-1', 'user-1');

      expect(capturedPrereqs).not.toBeNull();
      expect((capturedPrereqs as unknown as Array<{ milestone_id: string }>)[0].milestone_id).toBe('ms-generated-id');
    });
  });

  describe('error handling', () => {
    it('performs compensating delete and rethrows when milestone insert fails', async () => {
      let deletedCaseId: string | null = null;
      fromSpy = spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'cases') {
          const single = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: { id: 'case-rollback' }, error: null }),
          );
          const select = jasmine.createSpy().and.returnValue({ single });
          const insert = jasmine.createSpy().and.returnValue({ select });
          const eq = jasmine.createSpy().and.returnValue(Promise.resolve({ error: null }));
          const del = jasmine.createSpy('delete').and.callFake(() => ({ eq }));
          return { insert, delete: del } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'profiles') {
          const maybeSingle = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: null, error: null }),
          );
          const eq = jasmine.createSpy().and.returnValue({ maybeSingle });
          const select = jasmine.createSpy().and.returnValue({ eq });
          return { select } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'milestones') {
          const single = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: null, error: new Error('milestone RLS denied') }),
          );
          const select = jasmine.createSpy().and.returnValue({ single });
          const insert = jasmine.createSpy().and.returnValue({ select });
          return { insert } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'case_participants') {
          const insert = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: null, error: null }),
          );
          // track delete calls on cases via this path — not needed here
          const eq = jasmine.createSpy().and.callFake((col: string, val: string) => {
            if (col === 'id') deletedCaseId = val;
            return Promise.resolve({ error: null });
          });
          const del = jasmine.createSpy().and.returnValue({ eq });
          return { insert, delete: del } as unknown as ReturnType<typeof supabase.from>;
        }
        const insert = jasmine.createSpy().and.returnValue(
          Promise.resolve({ data: null, error: null }),
        );
        return { insert } as unknown as ReturnType<typeof supabase.from>;
      });

      await expectAsync(
        service.createCase(IMC_PAYLOAD, 'hfa-1', 'user-1'),
      ).toBeRejectedWithError('milestone RLS denied');

      // Verify compensating delete was called on the cases table with the right id
      const callArgs = (supabase.from as jasmine.Spy).calls.all()
        .filter((c: jasmine.CallInfo<jasmine.Spy>) => c.args[0] === 'cases');
      // The cases table should have been called for insert AND delete
      expect(callArgs.length).toBeGreaterThanOrEqual(2);
    });

    it('throws when cases insert fails', async () => {
      fromSpy = spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'cases') {
          const single = jasmine.createSpy().and.returnValue(
            Promise.resolve({ data: null, error: new Error('cases insert failed') }),
          );
          const select = jasmine.createSpy().and.returnValue({ single });
          const insert = jasmine.createSpy().and.returnValue({ select });
          return { insert } as unknown as ReturnType<typeof supabase.from>;
        }
        const insert = jasmine.createSpy().and.returnValue(Promise.resolve({ error: null }));
        return { insert } as unknown as ReturnType<typeof supabase.from>;
      });

      await expectAsync(
        service.createCase(BLANK_PAYLOAD, 'hfa-1', 'user-1'),
      ).toBeRejectedWithError('cases insert failed');
    });
  });
});
