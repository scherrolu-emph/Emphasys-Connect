import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { ParticipantsTabComponent } from './participants-tab.component';
import type { CaseParticipant } from '../../core/cases/case.models';

const makeParticipant = (
  id: string,
  role: CaseParticipant['role'] = 'developer',
  userId = `user-${id}`,
): CaseParticipant => ({
  id,
  hfaId: 'hfa-1',
  caseId: 'case-1',
  userId,
  email: `${id}@example.com`,
  displayName: `User ${id}`,
  role,
  inviteStatus: 'accepted',
});

const makePending = (id: string): CaseParticipant => ({
  ...makeParticipant(id),
  displayName: null,
  inviteStatus: 'pending',
});

async function create(
  participants: CaseParticipant[],
  currentUserId: string | null,
  isHfa: boolean,
): Promise<ComponentFixture<ParticipantsTabComponent>> {
  await TestBed.configureTestingModule({
    imports: [ParticipantsTabComponent, IonicModule.forRoot()],
  }).compileComponents();

  const fixture = TestBed.createComponent(ParticipantsTabComponent);
  fixture.componentRef.setInput('participants', participants);
  fixture.componentRef.setInput('currentUserId', currentUserId);
  fixture.componentRef.setInput('currentUserHfaId', 'hfa-1');
  fixture.componentRef.setInput('isHfa', isHfa);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('ParticipantsTabComponent', () => {
  describe('grouping', () => {
    it('renders YOUR AGENCY section for hfa_staff participants', async () => {
      const p = makeParticipant('p1', 'hfa_staff');
      const fixture = await create([p], null, false);
      const headers = fixture.debugElement.queryAll(By.css('.section-header'));
      const texts = headers.map(h => (h.nativeElement as HTMLElement).textContent ?? '');
      expect(texts.some(t => t.includes('YOUR AGENCY'))).toBeTrue();
    });

    it('renders DEVELOPER section for developer participants', async () => {
      const p = makeParticipant('p1', 'developer');
      const fixture = await create([p], null, false);
      const headers = fixture.debugElement.queryAll(By.css('.section-header'));
      const texts = headers.map(h => (h.nativeElement as HTMLElement).textContent ?? '');
      expect(texts.some(t => t.includes('DEVELOPER'))).toBeTrue();
    });

    it('hides empty sections', async () => {
      const p = makeParticipant('p1', 'developer');
      const fixture = await create([p], null, false);
      const headers = fixture.debugElement.queryAll(By.css('.section-header'));
      const texts = headers.map(h => (h.nativeElement as HTMLElement).textContent ?? '');
      expect(texts.some(t => t.includes('YOUR AGENCY'))).toBeFalse();
      expect(texts.some(t => t.includes('OTHER PARTICIPANTS'))).toBeFalse();
    });
  });

  describe('YOU badge', () => {
    it('shows YOU badge on current user row', async () => {
      const p = makeParticipant('p1', 'developer', 'current-user');
      const fixture = await create([p], 'current-user', false);
      const badges = fixture.debugElement.queryAll(By.css('.badge-you'));
      expect(badges.length).toBe(1);
    });

    it('does not show YOU badge for other users', async () => {
      const p = makeParticipant('p1', 'developer', 'other-user');
      const fixture = await create([p], 'current-user', false);
      const badges = fixture.debugElement.queryAll(By.css('.badge-you'));
      expect(badges.length).toBe(0);
    });
  });

  describe('HFA actions', () => {
    it('shows trash button for other participants when HFA', async () => {
      const p1 = makeParticipant('p1', 'hfa_staff', 'current-user');
      const p2 = makeParticipant('p2', 'developer', 'other-user');
      const fixture = await create([p1, p2], 'current-user', true);
      const trashBtns = fixture.debugElement.queryAll(By.css('.btn-remove'));
      expect(trashBtns.length).toBe(1);
    });

    it('does not show trash button when not HFA', async () => {
      const p1 = makeParticipant('p1', 'developer', 'current-user');
      const p2 = makeParticipant('p2', 'developer', 'other-user');
      const fixture = await create([p1, p2], 'current-user', false);
      const trashBtns = fixture.debugElement.queryAll(By.css('.btn-remove'));
      expect(trashBtns.length).toBe(0);
    });

    it('shows Add participant button for HFA', async () => {
      const fixture = await create([], 'current-user', true);
      const addBtn = fixture.debugElement.query(By.css('.add-cta'));
      expect(addBtn).toBeTruthy();
    });

    it('does not show Add participant button for non-HFA', async () => {
      const fixture = await create([], 'current-user', false);
      const addBtn = fixture.debugElement.query(By.css('.add-cta'));
      expect(addBtn).toBeNull();
    });
  });

  describe('remove guard', () => {
    it('blocks removing the only Developer and shows error', async () => {
      const p1 = makeParticipant('p1', 'hfa_staff', 'current-user');
      const p2 = makeParticipant('p2', 'developer', 'other-user');
      const fixture = await create([p1, p2], 'current-user', true);
      const component = fixture.componentInstance;

      component.confirmRemove(p2);
      fixture.detectChanges();

      expect(component.removingId()).toBeNull();
      expect(component.addError()).toBeTruthy();
    });

    it('allows removing a Developer when another Developer exists', async () => {
      const p1 = makeParticipant('p1', 'developer', 'dev-1');
      const p2 = makeParticipant('p2', 'developer', 'dev-2');
      const fixture = await create([p1, p2], 'current-user', true);
      const component = fixture.componentInstance;

      component.confirmRemove(p1);

      expect(component.removingId()).toBe('p1');
      expect(component.addError()).toBeNull();
    });
  });

  describe('add form validation', () => {
    it('shows error for invalid email', async () => {
      const fixture = await create([], 'current-user', true);
      const component = fixture.componentInstance;
      component.openAddForm();
      component.addEmail.set('not-an-email');
      component.submitAdd();
      expect(component.addError()).toBeTruthy();
      expect(component.addFormOpen()).toBeTrue();
    });

    it('emits addParticipant and closes form on valid submission', async () => {
      const fixture = await create([], 'current-user', true);
      const component = fixture.componentInstance;
      const emitted: { email: string; role: string }[] = [];
      fixture.componentInstance.addParticipant.subscribe(r => emitted.push(r));

      component.openAddForm();
      component.addEmail.set('new@example.com');
      component.addRole.set('developer');
      component.submitAdd();

      expect(emitted.length).toBe(1);
      expect(emitted[0].email).toBe('new@example.com');
      expect(emitted[0].role).toBe('developer');
      expect(component.addFormOpen()).toBeFalse();
    });
  });

  describe('pending invites', () => {
    it('shows Pending badge for participants with no displayName', async () => {
      const p = makePending('p1');
      const fixture = await create([p], null, false);
      const pending = fixture.debugElement.queryAll(By.css('ion-badge[color="medium"]'));
      expect(pending.length).toBeGreaterThan(0);
    });
  });
});
