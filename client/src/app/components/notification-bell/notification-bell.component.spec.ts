import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationBellComponent } from './notification-bell.component';
import { NotificationService } from '../../core/notification/notification.service';
import type { AppNotification, OverdueItem } from '../../core/notification/notification.model';

const makeNotification = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n-1', hfaId: 'hfa-1', userId: 'u-1', caseId: 'case-1',
  type: 'mention', title: 'You were mentioned in Riverside Commons',
  body: 'Hey team!', prereqId: null, read: false,
  readAt: null, createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
  ...overrides,
});

const makeOverdue = (overrides: Partial<OverdueItem> = {}): OverdueItem => ({
  caseId: 'case-1', caseTitle: 'Riverside Commons',
  milestoneId: 'm-1', milestoneName: 'Pre-Construction', daysOverdue: 3,
  ...overrides,
});

describe('NotificationBellComponent', () => {
  let fixture: ComponentFixture<NotificationBellComponent>;
  let component: NotificationBellComponent;

  const notificationsSignal = signal<AppNotification[]>([]);
  const overdueSignal = signal<OverdueItem[]>([]);
  const unreadCount = computed(() => notificationsSignal().filter(n => !n.read).length);
  const overdueCount = computed(() => overdueSignal().length);
  const totalBadge = computed(() => unreadCount() + overdueCount());

  const mockNotifSvc = {
    notifications: notificationsSignal,
    overdueItems: overdueSignal,
    unreadCount,
    overdueCount,
    totalBadge,
    markAllRead: jasmine.createSpy('markAllRead').and.returnValue(Promise.resolve()),
  };

  const mockRouter = { navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)) };

  beforeEach(async () => {
    mockNotifSvc.markAllRead.calls.reset();
    mockRouter.navigate.calls.reset();
    notificationsSignal.set([]);
    overdueSignal.set([]);

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        { provide: NotificationService, useValue: mockNotifSvc },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders bell button', () => {
    expect(fixture.nativeElement.querySelector('.bell-btn')).not.toBeNull();
  });

  it('hides badge when totalBadge is 0', () => {
    expect(fixture.nativeElement.querySelector('.badge')).toBeNull();
  });

  it('shows badge when there are unread notifications', () => {
    notificationsSignal.set([makeNotification()]);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent.trim()).toBe('1');
  });

  it('shows badge when there are overdue items', () => {
    overdueSignal.set([makeOverdue()]);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent.trim()).toBe('1');
  });

  it('panel is hidden initially', () => {
    expect(fixture.nativeElement.querySelector('.notif-panel')).toBeNull();
  });

  it('togglePanel opens the panel', () => {
    component.togglePanel();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.notif-panel')).not.toBeNull();
  });

  it('togglePanel calls markAllRead when opening', () => {
    component.togglePanel();
    expect(mockNotifSvc.markAllRead).toHaveBeenCalledTimes(1);
  });

  it('togglePanel closes an open panel without calling markAllRead again', () => {
    component.togglePanel(); // open
    component.togglePanel(); // close
    expect(mockNotifSvc.markAllRead).toHaveBeenCalledTimes(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.notif-panel')).toBeNull();
  });

  it('shows empty state when panel is open and no notifications/overdue', () => {
    component.togglePanel();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("You're all caught up");
  });

  it('shows notification rows when panel is open', () => {
    notificationsSignal.set([makeNotification()]);
    component.togglePanel();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.notif-row')).not.toBeNull();
  });

  it('shows overdue rows when panel is open', () => {
    overdueSignal.set([makeOverdue()]);
    component.togglePanel();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.notif-row.overdue');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Pre-Construction');
  });

  it('navigateTo calls Router.navigate with correct path', () => {
    component.navigateTo('case-abc');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/cases', 'case-abc']);
  });

  it('navigateTo closes the panel', () => {
    component.panelOpen.set(true);
    component.navigateTo('case-abc');
    expect(component.panelOpen()).toBeFalse();
  });

  it('navigateTo does nothing when caseId is null', () => {
    component.navigateTo(null);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('onEscape closes the panel', () => {
    component.panelOpen.set(true);
    component.onEscape();
    expect(component.panelOpen()).toBeFalse();
  });

  describe('typeIcon', () => {
    it('returns chatbubble-outline for mention', () => {
      expect(component.typeIcon('mention')).toBe('chatbubble-outline');
    });
    it('returns person-add-outline for tagged', () => {
      expect(component.typeIcon('tagged')).toBe('person-add-outline');
    });
    it('returns document-text-outline for assigned', () => {
      expect(component.typeIcon('assigned')).toBe('document-text-outline');
    });
  });

  describe('relativeTime', () => {
    it('returns "just now" for < 1 minute ago', () => {
      const iso = new Date(Date.now() - 30_000).toISOString();
      expect(component.relativeTime(iso)).toBe('just now');
    });
    it('returns Xm ago for minutes', () => {
      const iso = new Date(Date.now() - 5 * 60_000).toISOString();
      expect(component.relativeTime(iso)).toBe('5m ago');
    });
    it('returns Xh ago for hours', () => {
      const iso = new Date(Date.now() - 3 * 3_600_000).toISOString();
      expect(component.relativeTime(iso)).toBe('3h ago');
    });
    it('returns Xd ago for days', () => {
      const iso = new Date(Date.now() - 2 * 86_400_000).toISOString();
      expect(component.relativeTime(iso)).toBe('2d ago');
    });
  });
});
