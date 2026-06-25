import { TestBed } from '@angular/core/testing';
import { ActivityService } from './activity.service';
import { supabase } from '../supabase/supabase.client';

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns an empty array when the user has no case participations', async () => {
    const fromSpy = jasmine.createSpyObj('from', ['select']);
    const selectSpy = jasmine.createSpyObj('select', ['eq']);
    selectSpy.eq.and.returnValue(Promise.resolve({ data: [], error: null }));
    fromSpy.select.and.returnValue(selectSpy);
    spyOn(supabase, 'from').and.returnValue(fromSpy as any);

    const result = await service.getActivity('user-1');

    expect(result).toEqual([]);
    expect(supabase.from).toHaveBeenCalledWith('case_participants');
  });

  it('maps system messages to ActivityItem with messageType "system" and no authorName', async () => {
    const participationData = [{ case_id: 'c1', cases: { id: 'c1', title: 'Riverside Commons' } }];
    const messageData = [{
      id: 'msg-1',
      type: 'system',
      content: 'HFA approved Draw Request Form',
      author_id: null,
      case_id: 'c1',
      created_at: '2026-06-25T10:00:00Z',
    }];

    let callCount = 0;
    spyOn(supabase, 'from').and.callFake((table: string) => {
      if (table === 'case_participants') {
        const sel = { eq: jasmine.createSpy().and.returnValue(Promise.resolve({ data: participationData, error: null })) };
        return { select: () => sel } as any;
      }
      if (table === 'conversation_messages') {
        const chain = {
          in: () => ({ order: () => ({ limit: () => Promise.resolve({ data: messageData, error: null }) }) }),
        };
        return { select: () => chain } as any;
      }
      callCount++;
      return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) } as any;
    });

    const result = await service.getActivity('user-1');

    expect(result.length).toBe(1);
    expect(result[0].messageId).toBe('msg-1');
    expect(result[0].messageType).toBe('system');
    expect(result[0].body).toBe('HFA approved Draw Request Form');
    expect(result[0].caseName).toBe('Riverside Commons');
    expect(result[0].caseId).toBe('c1');
    expect(result[0].authorName).toBeUndefined();
    expect(callCount).toBe(0);
  });

  it('resolves author display names for manual messages', async () => {
    const participationData = [{ case_id: 'c1', cases: { id: 'c1', title: 'Oak St Lofts' } }];
    const messageData = [{
      id: 'msg-2',
      type: 'message',
      content: 'Please review the attached docs',
      author_id: 'user-42',
      case_id: 'c1',
      created_at: '2026-06-25T11:00:00Z',
    }];
    const profileData = [{ id: 'user-42', display_name: 'Jane Developer' }];

    spyOn(supabase, 'from').and.callFake((table: string) => {
      if (table === 'case_participants') {
        return { select: () => ({ eq: () => Promise.resolve({ data: participationData, error: null }) }) } as any;
      }
      if (table === 'conversation_messages') {
        return { select: () => ({ in: () => ({ order: () => ({ limit: () => Promise.resolve({ data: messageData, error: null }) }) }) }) } as any;
      }
      if (table === 'profiles') {
        return { select: () => ({ in: () => Promise.resolve({ data: profileData, error: null }) }) } as any;
      }
      return { select: () => ({}) } as any;
    });

    const result = await service.getActivity('user-1');

    expect(result.length).toBe(1);
    expect(result[0].messageType).toBe('manual');
    expect(result[0].authorName).toBe('Jane Developer');
  });
});
