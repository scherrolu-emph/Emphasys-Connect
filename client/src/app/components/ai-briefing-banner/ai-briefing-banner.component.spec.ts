import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { AiBriefingBannerComponent } from './ai-briefing-banner.component';
import { AiBriefingService } from '../../core/ai-briefing/ai-briefing.service';
import { AuthService } from '../../core/auth/auth.service';

describe('AiBriefingBannerComponent', () => {
  let fixture: ComponentFixture<AiBriefingBannerComponent>;
  let component: AiBriefingBannerComponent;
  let briefingServiceSpy: jasmine.SpyObj<AiBriefingService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    briefingServiceSpy = jasmine.createSpyObj('AiBriefingService', [
      'getBriefing', 'startStream', 'dismiss'
    ]);
    briefingServiceSpy.getBriefing.and.returnValue({
      text: 'Test summary text.',
      chips: [{ label: 'View Tasks', route: '/my-tasks' }],
    });
    briefingServiceSpy.startStream.and.returnValue(() => {});

    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isHfa: signal(false),
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AiBriefingBannerComponent],
      providers: [
        { provide: AiBriefingService, useValue: briefingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiBriefingBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls getBriefing with isHfa from AuthService on init', () => {
    fixture.detectChanges();
    expect(briefingServiceSpy.getBriefing).toHaveBeenCalledWith(false);
  });

  it('shows skeleton before streaming starts', () => {
    fixture.detectChanges();
    expect(component.isStreaming()).toBeFalse();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-banner__skeleton')).toBeTruthy();
  });

  it('starts streaming after 300ms', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);
    expect(component.isStreaming()).toBeTrue();
    expect(briefingServiceSpy.startStream).toHaveBeenCalled();
  }));

  it('chips not visible before stream completes', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);
    expect(component.chipsVisible()).toBeFalse();
  }));

  it('dismiss calls briefingService.dismiss', () => {
    component.dismiss();
    expect(briefingServiceSpy.dismiss).toHaveBeenCalled();
  });

  it('onChip navigates to chip route', () => {
    component.onChip({ label: 'View Tasks', route: '/my-tasks' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-tasks']);
  });
});
