import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { NotificationBellComponent } from './notification-bell.component';
import { NotificationService } from '../../core/notification/notification.service';
import { NotificationPanelService } from '../../core/notification/notification-panel.service';

describe('NotificationBellComponent', () => {
  let fixture: ComponentFixture<NotificationBellComponent>;

  const totalBadge = signal(0);
  const mockNotifSvc = {
    totalBadge,
    markAllRead: jasmine.createSpy('markAllRead').and.returnValue(Promise.resolve()),
  };
  const mockPanelSvc = {
    open: signal(false),
    toggle: jasmine.createSpy('toggle'),
  };

  beforeEach(async () => {
    totalBadge.set(0);
    mockNotifSvc.markAllRead.calls.reset();
    mockPanelSvc.toggle.calls.reset();

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        { provide: NotificationService, useValue: mockNotifSvc },
        { provide: NotificationPanelService, useValue: mockPanelSvc },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    fixture.detectChanges();
  });

  it('renders bell button', () => {
    expect(fixture.nativeElement.querySelector('.bell-btn')).not.toBeNull();
  });

  it('hides badge when totalBadge is 0', () => {
    expect(fixture.nativeElement.querySelector('.badge')).toBeNull();
  });

  it('shows badge with correct count when totalBadge > 0', () => {
    totalBadge.set(3);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent.trim()).toBe('3');
  });

  it('calls panelSvc.toggle on button click', () => {
    fixture.nativeElement.querySelector('.bell-btn').click();
    expect(mockPanelSvc.toggle).toHaveBeenCalledTimes(1);
  });
});

