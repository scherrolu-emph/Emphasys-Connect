import { TestBed } from '@angular/core/testing';
import { PrerequisiteService } from './prerequisite.service';
import { MilestoneService } from './milestone.service';
import { EdocsService } from './edocs.service';
import { supabase } from '../supabase/supabase.client';

function makeUpdateChain(resolveWith = { error: null }) {
  const eqSpy = jasmine.createSpy('eq').and.returnValue(Promise.resolve(resolveWith));
  const updateSpy = jasmine.createSpy('update').and.returnValue({ eq: eqSpy });
  return { builder: { update: updateSpy }, updateSpy, eqSpy };
}

function makeInsertSpy(resolveWith = { error: null }) {
  return jasmine.createSpy('insert').and.returnValue(Promise.resolve(resolveWith));
}

describe('PrerequisiteService', () => {
  let service: PrerequisiteService;
  let milestoneServiceSpy: jasmine.SpyObj<MilestoneService>;
  let edocsServiceSpy: jasmine.SpyObj<EdocsService>;

  beforeEach(() => {
    milestoneServiceSpy = jasmine.createSpyObj('MilestoneService', ['checkAndAdvance']);
    milestoneServiceSpy.checkAndAdvance.and.returnValue(Promise.resolve());
    edocsServiceSpy = jasmine.createSpyObj('EdocsService', ['generateUploadUrl']);
    edocsServiceSpy.generateUploadUrl.and.returnValue('https://edocs.stub/pr-1');

    TestBed.configureTestingModule({
      providers: [
        PrerequisiteService,
        { provide: MilestoneService, useValue: milestoneServiceSpy },
        { provide: EdocsService, useValue: edocsServiceSpy },
      ],
    });
    service = TestBed.inject(PrerequisiteService);
  });

  describe('markReady', () => {
    it('updates status to received_processing', async () => {
      const { builder, updateSpy } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        return { insert: insertSpy } as any;
      });

      await service.markReady('pr-1', 'My Prereq', 'case-1', 'hfa-1');

      expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({ status: 'received_processing' }));
    });

    it('inserts a system message with prereq title', async () => {
      const { builder } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        return { insert: insertSpy } as any;
      });

      await service.markReady('pr-1', 'My Prereq', 'case-1', 'hfa-1');

      expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        type: 'system',
        content: jasmine.stringContaining('My Prereq'),
      }));
    });

    it('throws when the prerequisites update fails', async () => {
      const eqSpy = jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: new Error('DB error') }));
      const updateSpy = jasmine.createSpy('update').and.returnValue({ eq: eqSpy });
      spyOn(supabase, 'from').and.returnValue({ update: updateSpy } as any);

      await expectAsync(service.markReady('pr-1', 'T', 'c1', 'h1')).toBeRejected();
    });
  });

  describe('accept', () => {
    it('updates status to accepted', async () => {
      const { builder, updateSpy } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        return { insert: insertSpy } as any;
      });

      await service.accept('pr-1', 'My Prereq', 'm-1', 'case-1', 'hfa-1');

      expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({ status: 'accepted' }));
    });

    it('calls MilestoneService.checkAndAdvance', async () => {
      const { builder } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        return { insert: insertSpy } as any;
      });

      await service.accept('pr-1', 'My Prereq', 'm-1', 'case-1', 'hfa-1');

      expect(milestoneServiceSpy.checkAndAdvance).toHaveBeenCalledWith('m-1', 'case-1', 'hfa-1');
    });
  });

  describe('returnWithNote', () => {
    it('updates status to pending_open and stores the note', async () => {
      const { builder, updateSpy } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        return { insert: insertSpy } as any;
      });

      await service.returnWithNote('pr-1', 'My Prereq', 'Please resubmit', 'case-1', 'hfa-1');

      expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        status: 'pending_open',
        returned: true,
        notes: 'Please resubmit',
      }));
    });

    it('includes the note text in the system message', async () => {
      const { builder } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        return { insert: insertSpy } as any;
      });

      await service.returnWithNote('pr-1', 'My Prereq', 'Please resubmit', 'case-1', 'hfa-1');

      expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        content: jasmine.stringContaining('Please resubmit'),
      }));
    });
  });

  describe('triggerDocumentRequest', () => {
    it('writes the eDocs upload URL to upload_link', async () => {
      const { builder, updateSpy } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        return { insert: insertSpy } as any;
      });

      await service.triggerDocumentRequest('pr-1', 'My Prereq', 'case-1', 'hfa-1');

      expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        upload_link: 'https://edocs.stub/pr-1',
        requested: true,
      }));
    });

    it('inserts a system message', async () => {
      const { builder } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        return { insert: insertSpy } as any;
      });

      await service.triggerDocumentRequest('pr-1', 'My Prereq', 'case-1', 'hfa-1');

      expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'system' }));
    });
  });
});
