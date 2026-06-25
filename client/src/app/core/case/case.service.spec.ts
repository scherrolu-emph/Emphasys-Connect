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

  it('getParticipantCases handles empty result', async () => {
    spyOn(supabase.from('case_participants'), 'select').and.returnValue(Promise.resolve({ data: [], error: null } as any));
    const res = await service.getParticipantCases('nonexistent');
    expect(res).toEqual([]);
  });
});
