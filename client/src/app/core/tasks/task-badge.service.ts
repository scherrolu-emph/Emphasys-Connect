import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TaskBadgeService {
  readonly count = signal<number>(0);
}
