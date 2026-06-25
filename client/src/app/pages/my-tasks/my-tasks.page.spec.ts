import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MyTasksPage } from './my-tasks.page';
import { AuthService } from '../../core/auth/auth.service';
import { TaskService } from '../../core/tasks/task.service';
import { TaskBadgeService } from '../../core/tasks/task-badge.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import type { MyTask } from '../../core/tasks/task.models';

const mockUser = { id: 'user-1' };

const mockTasks: MyTask[] = [
  {
    prereqId: 'pr-1',
    prereqTitle: 'Submit Plans',
    prereqType: 'document_submission',
    status: 'pending_open',
    caseId: 'case-1',
    caseTitle: 'River Commons',
    milestoneId: 'ms-1',
    milestoneName: 'Foundation',
  },
];

describe('MyTasksPage', () => {
  let fixture: ComponentFixture<MyTasksPage>;
  let component: MyTasksPage;
  let authSpy: jasmine.SpyObj<AuthService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let taskBadgeService: TaskBadgeService;
  let realtimeSpy: jasmine.SpyObj<RealtimeService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy('currentUser').and.returnValue(mockUser),
      isHfa: jasmine.createSpy('isHfa').and.returnValue(false),
      hfaId: jasmine.createSpy('hfaId').and.returnValue(null),
    });
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getMyTasks']);
    taskServiceSpy.getMyTasks.and.resolveTo(mockTasks);
    realtimeSpy = jasmine.createSpyObj('RealtimeService', [
      'subscribeToPrereqChanges',
      'unsubscribePrereqChanges',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    taskBadgeService = new TaskBadgeService();

    TestBed.configureTestingModule({
      imports: [MyTasksPage],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: TaskBadgeService, useValue: taskBadgeService },
        { provide: RealtimeService, useValue: realtimeSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    fixture = TestBed.createComponent(MyTasksPage);
    component = fixture.componentInstance;
  });

  describe('loading state', () => {
    it('shows skeleton rows before data loads', () => {
      fixture.detectChanges();
      const skeletons = fixture.nativeElement.querySelectorAll('ion-skeleton-text');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('hides skeleton after data loads', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const skeletons = fixture.nativeElement.querySelectorAll('ion-skeleton-text');
      expect(skeletons.length).toBe(0);
    }));
  });

  describe('task list', () => {
    it('renders one row per task', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll('ion-item[button]');
      expect(items.length).toBe(1);
    }));

    it('displays prereq title and case title', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Submit Plans');
      expect(text).toContain('River Commons');
    }));

    it('displays milestone name in secondary line', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Foundation');
    }));

    it('updates TaskBadgeService count with loaded task count', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(taskBadgeService.count()).toBe(1);
    }));
  });

  describe('empty state', () => {
    it('shows empty message when no tasks returned', fakeAsync(() => {
      taskServiceSpy.getMyTasks.and.resolveTo([]);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('No active tasks');
    }));

    it('sets badge count to 0 when task list is empty', fakeAsync(() => {
      taskServiceSpy.getMyTasks.and.resolveTo([]);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(taskBadgeService.count()).toBe(0);
    }));
  });

  describe('navigation', () => {
    it('navigates to /cases/:id when navigateToCase is called', () => {
      component.navigateToCase('case-abc');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/cases', 'case-abc']);
    });
  });

  describe('realtime', () => {
    it('subscribes to prereq changes for loaded case IDs', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(realtimeSpy.subscribeToPrereqChanges).toHaveBeenCalledWith(
        ['case-1'],
        jasmine.any(Function),
      );
    }));

    it('does not subscribe when no tasks exist', fakeAsync(() => {
      taskServiceSpy.getMyTasks.and.resolveTo([]);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(realtimeSpy.subscribeToPrereqChanges).not.toHaveBeenCalled();
    }));

    it('unsubscribes on component destroy', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      fixture.destroy();
      expect(realtimeSpy.unsubscribePrereqChanges).toHaveBeenCalled();
    }));
  });

  describe('unauthenticated', () => {
    it('does not call TaskService when currentUser is null', fakeAsync(() => {
      (authSpy.currentUser as jasmine.Spy).and.returnValue(null);
      fixture.detectChanges();
      tick();
      expect(taskServiceSpy.getMyTasks).not.toHaveBeenCalled();
    }));
  });
});
