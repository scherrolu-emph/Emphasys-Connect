import { TestBed } from '@angular/core/testing';
import { RealtimeService } from './realtime.service';
import { supabase } from '../supabase/supabase.client';
import type { RealtimeChannel } from '@supabase/supabase-js';

describe('RealtimeService', () => {
  let service: RealtimeService;
  let mockChannel: jasmine.SpyObj<RealtimeChannel>;

  beforeEach(() => {
    mockChannel = jasmine.createSpyObj<RealtimeChannel>('RealtimeChannel', [
      'on',
      'subscribe',
      'unsubscribe',
    ]);
    mockChannel.on.and.returnValue(mockChannel);
    mockChannel.subscribe.and.returnValue(mockChannel);
    mockChannel.unsubscribe.and.resolveTo('ok');

    spyOn(supabase, 'channel').and.returnValue(mockChannel);

    TestBed.configureTestingModule({});
    service = TestBed.inject(RealtimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('subscribeToCase', () => {
    it('creates a channel named "case:{caseId}" and calls subscribe', () => {
      service.subscribeToCase('case-abc');
      expect(supabase.channel).toHaveBeenCalledWith('case:case-abc');
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('registers postgres_changes listeners for conversation_messages, prerequisites, and milestones', () => {
      service.subscribeToCase('case-abc');
      const onCalls = mockChannel.on.calls.allArgs() as [string, { table: string; filter: string }, unknown][];
      const tables = onCalls.map(([, opts]) => opts.table);
      expect(tables).toContain('conversation_messages');
      expect(tables).toContain('prerequisites');
      expect(tables).toContain('milestones');
      onCalls.forEach(([, opts]) => {
        expect(opts.filter).toBe('case_id=eq.case-abc');
      });
    });

    it('returns the same channel on duplicate calls without creating a second subscription', () => {
      const ch1 = service.subscribeToCase('case-abc');
      const ch2 = service.subscribeToCase('case-abc');
      expect(ch1).toBe(ch2);
      expect(supabase.channel).toHaveBeenCalledTimes(1);
    });

    it('creates independent channels for different caseIds', () => {
      const secondChannel = jasmine.createSpyObj<RealtimeChannel>('RealtimeChannel', ['on', 'subscribe', 'unsubscribe']);
      secondChannel.on.and.returnValue(secondChannel);
      secondChannel.subscribe.and.returnValue(secondChannel);
      (supabase.channel as jasmine.Spy).and.returnValues(mockChannel, secondChannel);
      service.subscribeToCase('case-1');
      service.subscribeToCase('case-2');
      expect(supabase.channel).toHaveBeenCalledTimes(2);
      expect(supabase.channel).toHaveBeenCalledWith('case:case-1');
      expect(supabase.channel).toHaveBeenCalledWith('case:case-2');
    });
  });

  describe('unsubscribe', () => {
    it('calls unsubscribe on the channel and removes it from the map', () => {
      service.subscribeToCase('case-abc');
      service.unsubscribe('case-abc');
      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });

    it('allows a fresh channel to be created after unsubscribe', () => {
      service.subscribeToCase('case-abc');
      service.unsubscribe('case-abc');
      service.subscribeToCase('case-abc');
      expect(supabase.channel).toHaveBeenCalledTimes(2);
    });

    it('is a no-op for an unknown caseId', () => {
      expect(() => service.unsubscribe('non-existent')).not.toThrow();
      expect(mockChannel.unsubscribe).not.toHaveBeenCalled();
    });
  });

  describe('activityMessage$', () => {
    it('is exposed as an observable', () => {
      expect(service.activityMessage$).toBeTruthy();
      expect(typeof service.activityMessage$.subscribe).toBe('function');
    });

    it('invokes onMessage callback when a message event fires via subscribeToCase', () => {
      const onMessageSpy = jasmine.createSpy('onMessage');
      service.subscribeToCase('case-abc', { onMessage: onMessageSpy });

      const onCalls = mockChannel.on.calls.allArgs() as [string, unknown, (p: unknown) => void][];
      const msgListener = onCalls.find(
        ([, opts]) => (opts as { table: string }).table === 'conversation_messages'
      )?.[2];

      expect(msgListener).toBeDefined();
      msgListener?.({ eventType: 'INSERT', new: { id: 'm1', content: 'hello' } });
      expect(onMessageSpy).toHaveBeenCalled();
    });
  });
});
