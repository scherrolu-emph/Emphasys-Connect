import { Injectable, WritableSignal, signal } from '@angular/core';

export interface BriefingChip {
  label: string;
  route: string;
}

export interface Briefing {
  text: string;
  chips: BriefingChip[];
}

@Injectable({ providedIn: 'root' })
export class AiBriefingService {
  readonly visible = signal(true);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  getBriefing(isHfa: boolean): Briefing {
    if (isHfa) {
      return {
        text: 'Since Thursday, 3 things need your attention. Developer on Sunrise Commons submitted 2 documents — one is awaiting your review. Riverdale Phase 2 has 3 overdue prerequisites. A developer on Lakeside Commons sent a message 2 days ago with no reply yet.',
        chips: [
          { label: 'View My Tasks', route: '/my-tasks' },
          { label: 'Open Sunrise Commons', route: '/cases/demo-case-1' },
          { label: 'Open Lakeside Commons', route: '/cases/demo-case-2' },
        ],
      };
    }
    return {
      text: 'Since Thursday, HFA accepted your foundation inspection on Sunrise Commons — Phase 2 is now active. You have 2 new prerequisites ready to action. One document upload is overdue by 3 days.',
      chips: [
        { label: 'View My Tasks', route: '/my-tasks' },
        { label: 'Open Sunrise Commons', route: '/cases/demo-case-1' },
      ],
    };
  }

  startStream(
    text: string,
    target: WritableSignal<string>,
    onComplete: () => void
  ): () => void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
    target.set('');
    let index = 0;
    this.intervalId = setInterval(() => {
      if (index < text.length) {
        target.update(current => current + text[index]);
        index++;
      } else {
        clearInterval(this.intervalId!);
        this.intervalId = null;
        onComplete();
      }
    }, 12);
    return () => {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }

  dismiss(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.visible.set(false);
  }

  resetAndShow(): void {
    this.visible.set(true);
  }
}
