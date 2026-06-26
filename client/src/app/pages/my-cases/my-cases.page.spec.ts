import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { MyCasesPage } from './my-cases.page';
import { AuthService } from '../../core/auth/auth.service';
import { CaseService, ParticipantCaseSummary } from '../../core/case/case.service';
import { AiBriefingService } from '../../core/ai-briefing/ai-briefing.service';
import { NotificationService } from '../../core/notification/notification.service';

const mockUser = { id: 'user-1' };

const mockCases: ParticipantCaseSummary[] = [
  {
    id: 'case-1',
    title: 'Park Ave Apts',
    activeMilestoneName: 'Pre-Construction',
    milestoneCompleted: 2,
    milestoneTotal: 5,
  },
];

describe('MyCasesPage', () => {
  let fixture: ComponentFixture<MyCasesPage>;
  let component: MyCasesPage;
  let authSpy: jasmine.SpyObj<AuthService>;
  let caseSpy: jasmine.SpyObj<CaseService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy().and.returnValue(mockUser),
      isHfa: signal(false),
    });
    caseSpy = jasmine.createSpyObj('CaseService', ['getParticipantCases']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    caseSpy.getParticipantCases.and.resolveTo(mockCases);

    const briefingServiceMock = {
      visible: signal(false),
      getBriefing: jasmine.createSpy().and.returnValue({ text: '', chips: [] }),
      startStream: jasmine.createSpy().and.returnValue(() => {}),
      dismiss: jasmine.createSpy(),
      resetAndShow: jasmine.createSpy(),
    };

    const notificationServiceMock = {
      unread: signal(0),
      totalBadge: signal(0),
      notifications: signal([]),
      overdueItems: signal([]),
      markAllRead: jasmine.createSpy().and.returnValue(Promise.resolve()),
    };

    TestBed.configureTestingModule({
      imports: [MyCasesPage],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: CaseService, useValue: caseSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AiBriefingService, useValue: briefingServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    fixture = TestBed.createComponent(MyCasesPage);
    component = fixture.componentInstance;
  });

  describe('loading state', () => {
    it('shows skeleton rows before ngOnInit resolves', () => {
      fixture.detectChanges();
      // 4 skeleton items × 2 ion-skeleton-text lines each = 8
      const skeletons = fixture.nativeElement.querySelectorAll('ion-skeleton-text');
      expect(skeletons.length).toBe(8);
    });

    it('hides skeleton after data loads', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const skeletons = fixture.nativeElement.querySelectorAll('ion-skeleton-text');
      expect(skeletons.length).toBe(0);
    }));
  });

  describe('case list', () => {
    it('renders one row per case returned by the service', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll('ion-item[button]');
      expect(items.length).toBe(1);
    }));

    it('displays case title in the row', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Park Ave Apts');
    }));

    it('displays milestone progress badge as X/Y milestones', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('2/5 milestones');
    }));
  });

  describe('empty state', () => {
    it('shows empty message when no cases are returned', fakeAsync(() => {
      caseSpy.getParticipantCases.and.resolveTo([]);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('added to cases by your HFA');
    }));

    it('shows empty state when service throws', fakeAsync(() => {
      caseSpy.getParticipantCases.and.rejectWith(new Error('network'));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('added to cases by your HFA');
    }));
  });

  describe('navigation', () => {
    it('navigates to /cases/:id when a case row is tapped', () => {
      component.onSelectCase('case-abc');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/cases', 'case-abc']);
    });
  });

  describe('unauthenticated', () => {
    it('renders nothing when currentUser is null', fakeAsync(() => {
      (authSpy.currentUser as jasmine.Spy).and.returnValue(null);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('ion-skeleton-text')).toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain("You'll be added");
    }));
  });
});
