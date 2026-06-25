import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastController } from '@ionic/angular/standalone';
import { CreateCaseConfirmPage } from './create-case-confirm.page';
import { AuthService } from '../../../core/auth/auth.service';
import { signal } from '@angular/core';
import type { CreateCaseRouteState } from '../../../core/cases/import.models';

const IMC_STATE: CreateCaseRouteState = {
  caseType: 'development_construction',
  imcProject: {
    id: 'imc-001',
    projectNumber: '2024-001',
    name: 'River View Apartments',
    address: '1200 River Rd',
    developerEmail: 'dev@demo.com',
    milestones: [],
  },
};

const BLANK_STATE: CreateCaseRouteState = {
  caseType: 'blank',
};

function buildAuthService(email = 'hfa@demo.com') {
  const profileSig = signal({ id: 'u-1', email, is_hfa: true });
  return { profile: () => profileSig() };
}

function buildToastController() {
  const toastSpy = jasmine.createSpyObj('toast', ['present']);
  return jasmine.createSpyObj('ToastController', {
    create: Promise.resolve(toastSpy),
  });
}

describe('CreateCaseConfirmPage', () => {
  let component: CreateCaseConfirmPage;
  let router: Router;
  let toastCtrl: jasmine.SpyObj<ToastController>;

  function createComponent(routeState: CreateCaseRouteState | null = null) {
    TestBed.configureTestingModule({
      imports: [CreateCaseConfirmPage, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: buildAuthService() },
        { provide: ToastController, useValue: buildToastController() },
      ],
    });

    if (routeState) {
      // Patch history.state so ngOnInit reads the stub
      spyOnProperty(history, 'state').and.returnValue(routeState);
    }

    const fixture = TestBed.createComponent(CreateCaseConfirmPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    toastCtrl = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('ngOnInit redirect', () => {
    it('redirects to /create-case/type when no route state present', () => {
      spyOnProperty(history, 'state').and.returnValue({});
      TestBed.configureTestingModule({
        imports: [CreateCaseConfirmPage, RouterTestingModule],
        providers: [
          { provide: AuthService, useValue: buildAuthService() },
          { provide: ToastController, useValue: buildToastController() },
        ],
      });
      const fixture = TestBed.createComponent(CreateCaseConfirmPage);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate');
      fixture.detectChanges();
      expect(navSpy).toHaveBeenCalledWith(['/create-case/type'], jasmine.any(Object));
    });
  });

  describe('computed signals', () => {
    it('isImcBacked is true for development_construction with imcProject', () => {
      createComponent(IMC_STATE);
      expect(component.isImcBacked()).toBeTrue();
    });

    it('isImcBacked is false for blank case', () => {
      createComponent(BLANK_STATE);
      expect(component.isImcBacked()).toBeFalse();
    });

    it('isBlankLike is true for blank', () => {
      createComponent(BLANK_STATE);
      expect(component.isBlankLike()).toBeTrue();
    });

    it('isBlankLike is true for loan_underwriting', () => {
      createComponent({ caseType: 'loan_underwriting' });
      expect(component.isBlankLike()).toBeTrue();
    });

    it('isBlankLike is true for bond_issuance', () => {
      createComponent({ caseType: 'bond_issuance' });
      expect(component.isBlankLike()).toBeTrue();
    });

    it('canCreate is false when isBlankLike and title is empty', () => {
      createComponent(BLANK_STATE);
      expect(component.caseTitle()).toBe('');
      expect(component.canCreate()).toBeFalse();
    });

    it('canCreate is true when isBlankLike and title is non-empty', () => {
      createComponent(BLANK_STATE);
      component.caseTitle.set('My Case');
      expect(component.canCreate()).toBeTrue();
    });

    it('canCreate is true for IMC-backed case (no title required)', () => {
      createComponent(IMC_STATE);
      expect(component.canCreate()).toBeTrue();
    });
  });

  describe('participants initialisation', () => {
    it('pre-populates HFA creator from auth profile', () => {
      createComponent(BLANK_STATE);
      expect(component.participants().some(p => p.email === 'hfa@demo.com' && p.source === 'creator')).toBeTrue();
    });

    it('pre-populates developer from IMC project for dev_const type', () => {
      createComponent(IMC_STATE);
      expect(component.participants().some(p => p.email === 'dev@demo.com' && p.source === 'imc')).toBeTrue();
    });
  });

  describe('addParticipant()', () => {
    beforeEach(() => {
      createComponent(BLANK_STATE);
    });

    it('adds a valid participant and closes form', async () => {
      component.newEmail.set('new@demo.com');
      component.newRole.set('developer');
      await component.addParticipant();
      expect(component.participants().some(p => p.email === 'new@demo.com')).toBeTrue();
      expect(component.showAddForm()).toBeFalse();
    });

    it('does nothing for invalid email (no @ sign)', async () => {
      const before = component.participants().length;
      component.newEmail.set('notanemail');
      await component.addParticipant();
      expect(component.participants().length).toBe(before);
    });

    it('does nothing for empty email', async () => {
      const before = component.participants().length;
      component.newEmail.set('');
      await component.addParticipant();
      expect(component.participants().length).toBe(before);
    });

    it('shows toast for duplicate email', async () => {
      component.newEmail.set('hfa@demo.com');
      await component.addParticipant();
      expect(toastCtrl.create).toHaveBeenCalled();
    });

    it('deduplicates case-insensitively', async () => {
      component.newEmail.set('HFA@DEMO.COM');
      const before = component.participants().length;
      await component.addParticipant();
      expect(component.participants().length).toBe(before);
    });
  });

  describe('removeParticipant()', () => {
    beforeEach(() => {
      createComponent(BLANK_STATE);
    });

    it('removes participant by email', () => {
      component.participants.update(list => [
        ...list,
        { email: 'remove@demo.com', role: 'developer', source: 'manual' },
      ]);
      component.removeParticipant('remove@demo.com');
      expect(component.participants().some(p => p.email === 'remove@demo.com')).toBeFalse();
    });
  });

  describe('isRemovable()', () => {
    it('returns true only for manual participants', () => {
      createComponent(BLANK_STATE);
      expect(component.isRemovable({ email: 'a@b.com', role: 'developer', source: 'manual' })).toBeTrue();
      expect(component.isRemovable({ email: 'a@b.com', role: 'hfa_staff', source: 'creator' })).toBeFalse();
      expect(component.isRemovable({ email: 'a@b.com', role: 'developer', source: 'imc' })).toBeFalse();
    });
  });

  describe('proceed()', () => {
    it('navigates to /create-case/create with payload', () => {
      createComponent(BLANK_STATE);
      component.caseTitle.set('Test Case');
      const navSpy = spyOn(router, 'navigate');
      component.proceed();
      expect(navSpy).toHaveBeenCalledWith(
        ['/create-case/create'],
        jasmine.objectContaining({ state: jasmine.objectContaining({ payload: jasmine.any(Object) }) }),
      );
    });

    it('uses imcProject name as title for IMC-backed case', () => {
      createComponent(IMC_STATE);
      let captured: unknown = null;
      spyOn(router, 'navigate').and.callFake((_cmds, extras) => {
        captured = extras?.state;
        return Promise.resolve(true);
      });
      component.proceed();
      const state = captured as { payload: { title: string } };
      expect(state.payload.title).toBe('River View Apartments');
    });
  });

  describe('back()', () => {
    it('routes to /create-case/search for development_construction', () => {
      createComponent(IMC_STATE);
      const navSpy = spyOn(router, 'navigate');
      component.back();
      expect(navSpy).toHaveBeenCalledWith(['/create-case/search'], jasmine.any(Object));
    });

    it('routes to /create-case/type for blank case', () => {
      createComponent(BLANK_STATE);
      const navSpy = spyOn(router, 'navigate');
      component.back();
      expect(navSpy).toHaveBeenCalledWith(['/create-case/type']);
    });
  });
});
