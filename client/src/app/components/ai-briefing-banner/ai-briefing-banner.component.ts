import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AiBriefingService, BriefingChip } from '../../core/ai-briefing/ai-briefing.service';

@Component({
  selector: 'app-ai-briefing-banner',
  templateUrl: './ai-briefing-banner.component.html',
  styleUrls: ['./ai-briefing-banner.component.scss'],
  standalone: true,
  imports: [],
})
export class AiBriefingBannerComponent implements OnInit, OnDestroy {
  private readonly briefingService = inject(AiBriefingService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly streamedText = signal('');
  readonly isStreaming = signal(false);
  readonly chipsVisible = signal(false);
  readonly chips = signal<BriefingChip[]>([]);

  private initTimer: ReturnType<typeof setTimeout> | null = null;
  private cleanupStream: (() => void) | null = null;

  ngOnInit(): void {
    const { text, chips } = this.briefingService.getBriefing(this.auth.isHfa());
    this.chips.set(chips);
    this.initTimer = setTimeout(() => {
      this.isStreaming.set(true);
      this.cleanupStream = this.briefingService.startStream(
        text,
        this.streamedText,
        () => this.chipsVisible.set(true)
      );
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.initTimer !== null) {
      clearTimeout(this.initTimer);
    }
    this.cleanupStream?.();
  }

  dismiss(): void {
    this.briefingService.dismiss();
  }

  onChip(chip: BriefingChip): void {
    this.router.navigate([chip.route]);
  }
}
