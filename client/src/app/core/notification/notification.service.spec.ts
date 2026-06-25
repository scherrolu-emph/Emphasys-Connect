import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { NotificationService } from './notification.service';
import { AuthService } from '../auth/auth.service';
import { supabase } from '../supabase/supabase.client';
import type { AppNotification, OverdueItem } from './notification.model';

const makeNotif = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n-1', hfaId: 'hfa-1', userId: 'u-1', caseId: 'case-1',
  type: 'mention', title: 'You were mentioned', body: 'Hey!',
  prereqId: null, read: false, readAt: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const makeOverdue = (): OverdueItem => ({
  caseId: 'case-1', caseTitle: 'Riverside Commons',
  milestoneId: 'm-1', milestoneName: 'Pre-Construction', daysOverdue: 2,
});

describe('NotificationService', () => {
  let service: NotificationService;
  const currentUserSignal = signal<{ id: string } | null>(null);

  const mockAuth = {
    currentUser: computed(() => currentUserSignal()),
    isHfa: computed(() => false),
  };

  // Minimal Supabase query chain stub — returns empty data for all .select() calls
  const noopChain = {
    select: () => noopChain,
    eq: () => noopChain,
    not: () => noopChain,
    order: () => noopChain,
    limit: () => Promise.resolve({ data: [], error: null }),
    update: () => noopChain,
    insert: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (v: unknown) => void) => Promise.resolve({ data: [], error: null }).then(resolve),
  };

  beforeEach(() => {
    currentUserSignal.set(null);
    spyOn(supabase, 'from').and.returnValue(noopChain as ReturnType<typeof supabase.from>);
    // Prevent Realtime channel from throwing
    spyOn(supabase, 'channel').and.returnValue({
      on: function() { return this; },
      subscribe: function() { return this; },
      unsubscribe: () => Promise.resolve('ok' as const),
    } as unknown as ReturnType<typeof supabase.channel>);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: AuthService, useValue: mockAuth },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  // --- Computed signals ---

  it('unreadCount is 0 when notifications is empty', () => {
    service.notifications.set([]);
    expect(service.unreadCount()).toBe(0);
  });

  it('unreadCount counts only unread notifications', () => {
    service.notifications.set([
      makeNotif({ id: 'n-1', read: false }),
      makeNotif({ id: 'n-2', read: true }),
      makeNotif({ id: 'n-3', read: false }),
    ]);
    expect(service.unreadCount()).toBe(2);
  });

  it('overdueCount reflects overdueItems length', () => {
    service.overdueItems.set([makeOverdue(), makeOverdue()]);
    expect(service.overdueCount()).toBe(2);
  });

  it('totalBadge is sum of unreadCount and overdueCount', () => {
    service.notifications.set([makeNotif({ read: false }), makeNotif({ id: 'n-2', read: true })]);
    service.overdueItems.set([makeOverdue()]);
    expect(service.totalBadge()).toBe(2); // 1 unread + 1 overdue
  });

  it('totalBadge is 0 when no unread notifications and no overdue items', () => {
    service.notifications.set([makeNotif({ read: true })]);
    service.overdueItems.set([]);
    expect(service.totalBadge()).toBe(0);
  });

  // --- markAllRead signal update ---

  it('markAllRead sets all notifications to read in the signal', fakeAsync(async () => {
    currentUserSignal.set({ id: 'u-1' });
    service.notifications.set([
      makeNotif({ id: 'n-1', read: false }),
      makeNotif({ id: 'n-2', read: false }),
    ]);
    await service.markAllRead();
    tick();
    expect(service.notifications().every(n => n.read)).toBeTrue();
  }));

  it('markAllRead is a no-op when no current user', fakeAsync(async () => {
    currentUserSignal.set(null);
    service.notifications.set([makeNotif({ read: false })]);
    await service.markAllRead();
    tick();
    expect(service.notifications()[0].read).toBeFalse();
  }));

  it('markAllRead resets unreadCount to 0', fakeAsync(async () => {
    currentUserSignal.set({ id: 'u-1' });
    service.notifications.set([
      makeNotif({ id: 'n-1', read: false }),
      makeNotif({ id: 'n-2', read: false }),
    ]);
    await service.markAllRead();
    tick();
    expect(service.unreadCount()).toBe(0);
  }));

  // --- on logout ---

  it('clears notifications and overdueItems when user logs out', () => {
    service.notifications.set([makeNotif()]);
    service.overdueItems.set([makeOverdue()]);
    currentUserSignal.set(null);
    TestBed.flushEffects();
    expect(service.notifications()).toEqual([]);
    expect(service.overdueItems()).toEqual([]);
  });
});
