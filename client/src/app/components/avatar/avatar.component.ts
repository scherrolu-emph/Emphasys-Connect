import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

const PALETTE = [
  '#4f7cff', // blue
  '#22c55e', // green
  '#f97316', // orange
  '#a855f7', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#ec4899', // pink
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar" [style.background-color]="color()" [style.width.px]="size()" [style.height.px]="size()" [style.font-size.px]="fontSize()">
      {{ label() }}
    </div>
  `,
  styles: [`
    .avatar {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }
  `],
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly size = input<number>(36);

  readonly label = computed(() => initials(this.name()));
  readonly color = computed(() => PALETTE[hashName(this.name()) % PALETTE.length]);
  readonly fontSize = computed(() => Math.round(this.size() * 0.38));
}
