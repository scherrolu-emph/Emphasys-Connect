import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AiBriefingService } from './ai-briefing.service';

describe('AiBriefingService', () => {
  let service: AiBriefingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiBriefingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('visible starts as true', () => {
    expect(service.visible()).toBeTrue();
  });

  it('getBriefing returns HFA data for isHfa=true', () => {
    const b = service.getBriefing(true);
    expect(b.text).toContain('Sunrise Commons');
    expect(b.chips.length).toBe(3);
    expect(b.chips[0].route).toBe('/my-tasks');
  });

  it('getBriefing returns developer data for isHfa=false', () => {
    const b = service.getBriefing(false);
    expect(b.text).toContain('foundation inspection');
    expect(b.chips.length).toBe(2);
  });

  it('dismiss sets visible to false', () => {
    service.dismiss();
    expect(service.visible()).toBeFalse();
  });

  it('resetAndShow sets visible to true after dismiss', () => {
    service.dismiss();
    service.resetAndShow();
    expect(service.visible()).toBeTrue();
  });

  it('startStream emits characters one by one at 12ms intervals', fakeAsync(() => {
    const target = signal('');
    let done = false;
    service.startStream('Hi', target, () => { done = true; });
    tick(12);
    expect(target()).toBe('H');
    tick(12);
    expect(target()).toBe('Hi');
    tick(12); // fires onComplete
    expect(done).toBeTrue();
  }));

  it('startStream cleanup stops the interval', fakeAsync(() => {
    const target = signal('');
    const cleanup = service.startStream('Hello', target, () => {});
    tick(12);
    expect(target()).toBe('H');
    cleanup();
    tick(500);
    expect(target()).toBe('H');
  }));
});
