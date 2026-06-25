import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { CaseDetailPage } from './case-detail.page';
import { CaseDetailStore } from './case-detail.store';
import { CaseService } from '../../core/cases/case.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { AuthService } from '../../core/auth/auth.service';
import type { CaseDetail, CaseParticipant } from '../../core/cases/case.models';
import { signal } from '@angular/core';

const makeDetail = (): CaseDetail => ({
  id: 'case-1',
  hfaId: 'hfa-1',
  title: 'Lotus Apartments',
  referenceNumber: 'MF-2024-0188',
  caseType: 'development_construction',
  milestones: [],
  activeMilestone: null,
});

const makeParticipant = (id: string): CaseParticipant => ({
  id,
  hfaId: 'hfa-1',
  caseId: 'case-1',
  userId: `user-${id}`,
  email: `${id}@example.com`,
  displayName: `User ${id}`,
  role: 'developer',
  inviteStatus: 'accepted',
});

describe('CaseDetailPage', () => {
  let fixture: ComponentFixture<CaseDetailPage>;
  let component: CaseDetailPage;
  let storeSpy: jasmine.SpyObj<CaseDetailStore>;
  let realtimeSpy: jasmine.SpyObj<RealtimeService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('CaseDetailStore', ['loadCase', 'reset', 'refreshParticipants', 'appendMessage'], {
      caseDetail: signal<CaseDetail | null>(null),
      participants: signal<CaseParticipant[]>([]),
      messages: signal([]),
      loading: signal(false),
      error: signal<string | null>(null),
      activeMilestone: signal(null),
    });
    storeSpy.loadCase.and.returnValue(Promise.resolve());

    realtimeSpy = jasmine.createSpyObj('RealtimeService', ['subscribeToCase', 'unsubscribe']);
    realtimeSpy.subscribeToCase.and.returnValue({} as never);

    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { events: new Subject() });
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    authSpy = jasmine.createSpyObj('AuthService', [], {
      isHfa: signal(true),
      currentUser: signal({ id: 'current-user' }),
      hfaId: signal('hfa-1'),
    });

    await TestBed.configureTestingModule({
      imports: [CaseDetailPage, IonicModule.forRoot()],
      providers: [
        { provide: CaseDetailStore, useValue: storeSpy },
        { provide: RealtimeService, useValue: realtimeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'case-1' } } },
        },
        { provide: CaseService, useValue: jasmine.createSpyObj('CaseService', ['addParticipant', 'removeParticipant']) },
      ],
    })
      .overrideProvider(CaseDetailStore, { useValue: storeSpy })
      .compileComponents();

    fixture = TestBed.createComponent(CaseDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads case on ionViewWillEnter', async () => {
    await component.ionViewWillEnter();
    expect(storeSpy.loadCase).toHaveBeenCalledWith('case-1');
  });

  it('subscribes to realtime on ionViewWillEnter', async () => {
    storeSpy.loadCase.and.callFake(async () => {
      storeSpy.caseDetail.set(makeDetail());
    });
    component.ionViewWillEnter();
    // loadAndSubscribe is fire-and-forget; wait a tick for it to complete
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(realtimeSpy.subscribeToCase).toHaveBeenCalledWith('case-1', jasmine.any(Object));
  });

  it('unsubscribes on ionViewWillLeave', () => {
    component['caseId'] = 'case-1';
    component.ionViewWillLeave();
    expect(realtimeSpy.unsubscribe).toHaveBeenCalledWith('case-1');
    expect(storeSpy.reset).toHaveBeenCalled();
  });

  it('defaults activeTab to actions', () => {
    expect(component.activeTab()).toBe('actions');
  });

  it('setTab updates activeTab', () => {
    component.setTab('participants');
    expect(component.activeTab()).toBe('participants');
  });

  it('setTab to conversation resets lastReadAt', () => {
    const before = component.lastReadAt();
    component.setTab('conversation');
    expect(component.lastReadAt()).not.toBe(before);
  });

  it('defaults activeRightTab to conversation', () => {
    expect(component.activeRightTab()).toBe('conversation');
  });

  it('unreadCount is 0 with no messages newer than lastReadAt', () => {
    expect(component.unreadCount()).toBe(0);
  });

  it('shows case detail in header when loaded', async () => {
    storeSpy.caseDetail.set(makeDetail());
    fixture.detectChanges();
    await fixture.whenStable();
    const title = fixture.debugElement.query(By.css('.case-title'));
    expect(title?.nativeElement.textContent.trim()).toBe('Lotus Apartments');
  });

  it('ionViewWillLeave resets store and unsubscribes', () => {
    component['caseId'] = 'case-1';
    component.ionViewWillLeave();
    expect(storeSpy.reset).toHaveBeenCalled();
    expect(realtimeSpy.unsubscribe).toHaveBeenCalledWith('case-1');
  });
});
