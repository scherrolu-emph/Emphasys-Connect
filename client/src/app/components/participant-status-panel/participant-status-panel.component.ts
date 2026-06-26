import { Component, computed, input, output, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { attachOutline, chevronDownOutline } from 'ionicons/icons';
import type { MilestoneDetail, PrerequisiteSummary } from '../../core/cases/case.models';
import { getDisplayStatus, type DisplayPrereqStatus } from '../../core/cases/prereq-display-status.util';
import { PrereqStatusBadgeComponent } from '../prereq-status-badge/prereq-status-badge.component';
import { MilestoneStatusBadgeComponent } from '../milestone-status-badge/milestone-status-badge.component';

addIcons({ attachOutline, chevronDownOutline });

@Component({
  selector: 'app-participant-status-panel',
  standalone: true,
  imports: [IonIcon, PrereqStatusBadgeComponent, MilestoneStatusBadgeComponent],
  templateUrl: './participant-status-panel.component.html',
  styleUrls: ['./participant-status-panel.component.scss'],
})
export class ParticipantStatusPanelComponent {
  readonly milestones = input<MilestoneDetail[]>([]);
  readonly markReady = output<string>();
  readonly submitDocument = output<{ prereqId: string; prereqTitle: string; docName: string }>();

  private readonly ALLOWED_EXTENSIONS = new Set([
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'csv', 'png', 'jpg', 'jpeg', 'gif', 'zip',
  ]);

  private readonly userToggledIds = signal<Map<string, boolean>>(new Map());
  readonly selectedFiles = signal<Map<string, string>>(new Map());
  readonly fileErrors = signal<Map<string, string>>(new Map());
  readonly uploadingId = signal<string | null>(null);
  readonly expandedUploadIds = signal<Set<string>>(new Set());

  readonly expandedMilestoneIds = computed<Set<string>>(() => {
    const toggles = this.userToggledIds();
    const result = new Set<string>();
    for (const m of this.milestones()) {
      const explicit = toggles.get(m.id);
      if (explicit !== undefined ? explicit : m.status === 'active') result.add(m.id);
    }
    return result;
  });

  toggleMilestone(id: string): void {
    this.userToggledIds.update(map => {
      const next = new Map(map);
      next.set(id, !this.expandedMilestoneIds().has(id));
      return next;
    });
  }

  toggleUpload(prereqId: string): void {
    this.expandedUploadIds.update(set => {
      const next = new Set(set);
      if (next.has(prereqId)) {
        next.delete(prereqId);
        this.selectedFiles.update(m => { const n = new Map(m); n.delete(prereqId); return n; });
        this.fileErrors.update(m => { const n = new Map(m); n.delete(prereqId); return n; });
      } else {
        next.add(prereqId);
      }
      return next;
    });
  }

  onMarkReady(prereqId: string): void {
    this.markReady.emit(prereqId);
  }

  onFileSelected(prereqId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!this.ALLOWED_EXTENSIONS.has(ext)) {
      this.fileErrors.update(m => { const n = new Map(m); n.set(prereqId, `".${ext}" files are not allowed. Use PDF, Word, Excel, PowerPoint, CSV, image, or ZIP.`); return n; });
      input.value = '';
      return;
    }
    this.fileErrors.update(m => { const n = new Map(m); n.delete(prereqId); return n; });
    this.selectedFiles.update(map => { const next = new Map(map); next.set(prereqId, file.name); return next; });
  }

  onSubmitDocument(prereqId: string, prereqTitle: string): void {
    const docName = this.selectedFiles().get(prereqId);
    if (!docName) return;
    this.uploadingId.set(prereqId);
    this.submitDocument.emit({ prereqId, prereqTitle, docName });
  }

  prereqDisplayStatus(prereq: PrerequisiteSummary, milestoneStatus: MilestoneDetail['status']): DisplayPrereqStatus {
    return getDisplayStatus(prereq, milestoneStatus);
  }
}
