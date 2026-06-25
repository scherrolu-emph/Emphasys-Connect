import { TestBed } from '@angular/core/testing';
import { MilestoneService } from './milestone.service';
import { supabase } from '../supabase/supabase.client';

describe('MilestoneService', () => {
  let service: MilestoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MilestoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('does nothing if not all prerequisites are accepted', async () => {
    const fromSpy = spyOn(supabase, 'from');
    const eqSpy = jasmine.createSpy('eq').and.returnValue(
      Promise.resolve({ data: [{ status: 'accepted' }, { status: 'pending_open' }], error: null }),
    );
    const selectSpy = jasmine.createSpy('select').and.returnValue({ eq: eqSpy });
    fromSpy.and.returnValue({ select: selectSpy } as any);

    await service.checkAndAdvance('m-1', 'case-1', 'hfa-1');

    // called from once for prerequisites; no further calls
    expect(fromSpy).toHaveBeenCalledTimes(1);
    expect(fromSpy).toHaveBeenCalledWith('prerequisites');
  });

  it('does nothing if prerequisites array is empty', async () => {
    const fromSpy = spyOn(supabase, 'from');
    const eqSpy = jasmine.createSpy('eq').and.returnValue(Promise.resolve({ data: [], error: null }));
    const selectSpy = jasmine.createSpy('select').and.returnValue({ eq: eqSpy });
    fromSpy.and.returnValue({ select: selectSpy } as any);

    await service.checkAndAdvance('m-1', 'case-1', 'hfa-1');

    expect(fromSpy).toHaveBeenCalledTimes(1);
  });

  it('completes milestone, activates next, and inserts system message when all accepted', async () => {
    let fromCallCount = 0;
    const insertSpy = jasmine.createSpy('insert').and.returnValue(Promise.resolve({ error: null }));

    spyOn(supabase, 'from').and.callFake((table: string) => {
      if (table === 'prerequisites') {
        const eq = jasmine.createSpy('eq').and.returnValue(
          Promise.resolve({ data: [{ status: 'accepted' }, { status: 'accepted' }], error: null }),
        );
        return { select: jasmine.createSpy('select').and.returnValue({ eq }) } as any;
      }

      if (table === 'milestones') {
        fromCallCount++;
        if (fromCallCount === 1) {
          // select('title, order_index').eq('id', id).single()
          const single = jasmine.createSpy('single').and.returnValue(
            Promise.resolve({ data: { title: 'M1', order_index: 0 }, error: null }),
          );
          const eq = jasmine.createSpy('eq').and.returnValue({ single });
          return { select: jasmine.createSpy('select').and.returnValue({ eq }) } as any;
        }
        if (fromCallCount === 2) {
          // update({...}).eq('id', id) — complete milestone
          const eq = jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null }));
          return { update: jasmine.createSpy('update').and.returnValue({ eq }) } as any;
        }
        if (fromCallCount === 3) {
          // select('id, title').eq.eq.gt.order.limit.maybeSingle — find next
          const maybeSingle = jasmine.createSpy('maybeSingle').and.returnValue(
            Promise.resolve({ data: { id: 'm-2', title: 'M2' }, error: null }),
          );
          const chain: any = { eq: () => chain, gt: () => chain, order: () => chain, limit: () => chain, maybeSingle };
          return { select: jasmine.createSpy('select').and.returnValue(chain) } as any;
        }
        if (fromCallCount === 4) {
          // update({...}).eq('id', m2id) — activate next milestone
          const eq = jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null }));
          return { update: jasmine.createSpy('update').and.returnValue({ eq }) } as any;
        }
      }

      if (table === 'conversation_messages') {
        return { insert: insertSpy } as any;
      }

      return {} as any;
    });

    await service.checkAndAdvance('m-1', 'case-1', 'hfa-1');

    expect(fromCallCount).toBe(4);
    expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      type: 'system',
      content: jasmine.stringContaining('M1'),
    }));
    expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      content: jasmine.stringContaining('M2'),
    }));
  });

  it('completes milestone with no system message referencing next when no next exists', async () => {
    let fromCallCount = 0;
    const insertSpy = jasmine.createSpy('insert').and.returnValue(Promise.resolve({ error: null }));

    spyOn(supabase, 'from').and.callFake((table: string) => {
      if (table === 'prerequisites') {
        const eq = jasmine.createSpy('eq').and.returnValue(
          Promise.resolve({ data: [{ status: 'accepted' }], error: null }),
        );
        return { select: jasmine.createSpy('select').and.returnValue({ eq }) } as any;
      }

      if (table === 'milestones') {
        fromCallCount++;
        if (fromCallCount === 1) {
          const single = jasmine.createSpy('single').and.returnValue(
            Promise.resolve({ data: { title: 'Final', order_index: 2 }, error: null }),
          );
          const eq = jasmine.createSpy('eq').and.returnValue({ single });
          return { select: jasmine.createSpy('select').and.returnValue({ eq }) } as any;
        }
        if (fromCallCount === 2) {
          const eq = jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null }));
          return { update: jasmine.createSpy('update').and.returnValue({ eq }) } as any;
        }
        if (fromCallCount === 3) {
          const maybeSingle = jasmine.createSpy('maybeSingle').and.returnValue(
            Promise.resolve({ data: null, error: null }),
          );
          const chain: any = { eq: () => chain, gt: () => chain, order: () => chain, limit: () => chain, maybeSingle };
          return { select: jasmine.createSpy('select').and.returnValue(chain) } as any;
        }
      }

      if (table === 'conversation_messages') return { insert: insertSpy } as any;
      return {} as any;
    });

    await service.checkAndAdvance('m-final', 'case-1', 'hfa-1');

    expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      content: jasmine.stringContaining('Final'),
    }));
    // Should NOT mention a next milestone
    const insertArgs = insertSpy.calls.mostRecent().args[0] as { content: string };
    expect(insertArgs.content).not.toContain('is now active');
  });
});
