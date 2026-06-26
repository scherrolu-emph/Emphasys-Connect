import { TestBed } from '@angular/core/testing';
import { PrerequisiteService } from './prerequisite.service';
import { MilestoneService } from './milestone.service';
import { EdocsService } from './edocs.service';
import { NotificationService } from '../notification/notification.service';
import { supabase } from '../supabase/supabase.client';

function makeUpdateChain(resolveWith = { error: null }) {
  const eqSpy = jasmine.createSpy('eq').and.returnValue(Promise.resolve(resolveWith));
  const updateSpy = jasmine.createSpy('update').and.returnValue({ eq: eqSpy });
  return { builder: { update: updateSpy }, updateSpy, eqSpy };
}

function makeInsertSpy(resolveWith = { error: null }) {
  return jasmine.createSpy('insert').and.returnValue(Promise.resolve(resolveWith));
}

function makeParticipantSelectStub(participants: { user_id: string }[] = []) {
  const notSpy = jasmine.createSpy('not').and.returnValue(Promise.resolve({ data: participants, error: null }));
  const eqRoleSpy = jasmine.createSpy('eq').and.returnValue({ not: notSpy });
  const eqCaseSpy = jasmine.createSpy('eq').and.returnValue({ eq: eqRoleSpy });
  return { select: jasmine.createSpy('select').and.returnValue({ eq: eqCaseSpy }) };
}

describe('PrerequisiteService', () => {
  let service: PrerequisiteService;
  let milestoneServiceSpy: jasmine.SpyObj<MilestoneService>;
  let edocsServiceSpy: jasmine.SpyObj<EdocsService>;
  let notifSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    milestoneServiceSpy = jasmine.createSpyObj('MilestoneService', ['checkAndAdvance']);
    milestoneServiceSpy.checkAndAdvance.and.returnValue(Promise.resolve());
    edocsServiceSpy = jasmine.createSpyObj('EdocsService', ['generateUploadUrl']);
    edocsServiceSpy.generateUploadUrl.and.returnValue('https://edocs.stub/pr-1');
    notifSpy = jasmine.createSpyObj('NotificationService', ['writeNotification']);
    notifSpy.writeNotification.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        PrerequisiteService,
        { provide: MilestoneService, useValue: milestoneServiceSpy },
        { provide: EdocsService, useValue: edocsServiceSpy },
        { provide: NotificationService, useValue: notifSpy },
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

  describe('submitDocument', () => {
    it('updates status to received_processing with doc_name and submitted_at', async () => {
      const { builder, updateSpy } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      const participantStub = makeParticipantSelectStub();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        if (table === 'case_participants') return participantStub as any;
        return { insert: insertSpy } as any;
      });

      await service.submitDocument('pr-1', 'My Prereq', 'report.pdf', 'case-1', 'hfa-1', 'Maria Torres');

      expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        status: 'received_processing',
        doc_name: 'report.pdf',
        submitted_at: jasmine.any(String),
      }));
    });

    it('inserts a system message with the submitter name and prereq title', async () => {
      const { builder } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      const participantStub = makeParticipantSelectStub();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        if (table === 'case_participants') return participantStub as any;
        return { insert: insertSpy } as any;
      });

      await service.submitDocument('pr-1', 'My Prereq', 'report.pdf', 'case-1', 'hfa-1', 'Maria Torres');

      expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        type: 'system',
        content: jasmine.stringContaining('Maria Torres'),
      }));
      expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        content: jasmine.stringContaining('My Prereq'),
      }));
      expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        content: jasmine.stringContaining('report.pdf'),
      }));
    });

    it('falls back to email in the message when displayName is null', async () => {
      const { builder } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      const participantStub = makeParticipantSelectStub();
      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        if (table === 'case_participants') return participantStub as any;
        return { insert: insertSpy } as any;
      });

      await service.submitDocument('pr-1', 'My Prereq', 'report.pdf', 'case-1', 'hfa-1', null, 'dev@demo.com');

      expect(insertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        content: jasmine.stringContaining('dev@demo.com'),
      }));
    });

    it('writes an assigned notification for each HFA staff participant', async () => {
      const { builder } = makeUpdateChain();
      const insertSpy = makeInsertSpy();
      const selectEqNotSpy = jasmine.createSpy('not').and.returnValue(Promise.resolve({
        data: [{ user_id: 'hfa-user-1' }, { user_id: 'hfa-user-2' }], error: null,
      }));
      const selectEqSpy = jasmine.createSpy('eq').and.returnValue({ not: selectEqNotSpy });
      const selectEqRoleSpy = jasmine.createSpy('eq').and.returnValue({ eq: selectEqSpy });
      const selectSpy = jasmine.createSpy('select').and.returnValue({ eq: selectEqRoleSpy });

      spyOn(supabase, 'from').and.callFake((table: string) => {
        if (table === 'prerequisites') return builder as any;
        if (table === 'case_participants') return { select: selectSpy } as any;
        return { insert: insertSpy } as any;
      });

      await service.submitDocument('pr-1', 'My Prereq', 'report.pdf', 'case-1', 'hfa-1', 'Maria Torres');

      expect(notifSpy.writeNotification).toHaveBeenCalledTimes(2);
      expect(notifSpy.writeNotification).toHaveBeenCalledWith(
        'hfa-1', 'hfa-user-1', 'case-1', 'assigned',
        jasmine.any(String), jasmine.stringContaining('My Prereq'), 'pr-1',
      );
    });

    it('throws when the prerequisites update fails', async () => {
      const eqSpy = jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: new Error('DB error') }));
      const updateSpy = jasmine.createSpy('update').and.returnValue({ eq: eqSpy });
      spyOn(supabase, 'from').and.returnValue({ update: updateSpy } as any);

      await expectAsync(
        service.submitDocument('pr-1', 'T', 'file.pdf', 'c1', 'h1', null, 'x@x.com'),
      ).toBeRejected();
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
