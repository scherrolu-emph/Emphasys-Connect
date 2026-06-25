---
stage: implement
bolt: "007"
created: 2026-06-25T00:00:00Z
---

## Implementation Walkthrough: Milestone/Prereq Display Panels

### Summary

Four new standalone components were created — two shared badge components and two panel components — and wired into the existing `CaseDetailComponent` slot placeholders from Bolt 006. The `CaseDetailStore` received one new computed signal. All components read from `CaseDetailStore.milestones()` and are purely presentational with no service calls.

### Structure Overview

Two shared badge components live in `components/` and are imported by the panels. Both panels receive `milestones: MilestoneDetail[]` as an input signal from the page, which passes `store.milestones()`. The `CaseDetailPage` now conditionally renders one panel per persona using `@if (isHfa())`.

### Completed Work

- [x] `client/src/app/components/prereq-status-badge/prereq-status-badge.component.ts` — maps `pending_open / received_processing / accepted` to label + CSS class via `computed()` signals
- [x] `client/src/app/components/prereq-status-badge/prereq-status-badge.component.html` — single `<span>` bound to computed class and label
- [x] `client/src/app/components/prereq-status-badge/prereq-status-badge.component.scss` — grey/amber/green pill styles using design tokens from ux-guide
- [x] `client/src/app/components/milestone-status-badge/milestone-status-badge.component.ts` — maps `open / active / completed` to label + CSS class
- [x] `client/src/app/components/milestone-status-badge/milestone-status-badge.component.html` — single `<span>` bound to computed class and label
- [x] `client/src/app/components/milestone-status-badge/milestone-status-badge.component.scss` — grey/blue/green pill styles
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.ts` — accepts `milestones` input; derives `activeMilestone` and `allComplete` via `computed()`; manages accordion state with `expandedPrereqId = signal<string | null>(null)`
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.html` — three-way empty state, active milestone header (no badge per AC), accordion prereq list with type icons + status badges + disabled action button placeholders
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.scss` — accordion toggle row, chevron rotation, expanded details section with disabled action buttons
- [x] `client/src/app/components/participant-status-panel/participant-status-panel.component.ts` — accepts `milestones` input; emits `markReady: output<string>()` for Bolt 008 to handle
- [x] `client/src/app/components/participant-status-panel/participant-status-panel.component.html` — all milestones with status badges; prereqs inline with upload link (`<a>` tag) and "Mark as ready" button per type/status condition
- [x] `client/src/app/components/participant-status-panel/participant-status-panel.component.scss` — two-column prereq row layout; upload link and mark-ready button styled to match UX guide
- [x] `client/src/app/pages/case-detail/case-detail.store.ts` — added `milestones = computed(() => this.caseDetail()?.milestones ?? [])` computed signal
- [x] `client/src/app/pages/case-detail/case-detail.page.ts` — imported both panel components; added `onMarkReady` stub (handler wired in Bolt 008)
- [x] `client/src/app/pages/case-detail/case-detail.page.html` — replaced both `empty-slot` placeholders (mobile tab + desktop left panel) with `@if (isHfa())` guards selecting the correct panel

### Key Decisions

- **Accordion state in component, not store**: `expandedPrereqId` is local UI state that doesn't need to survive navigation; keeping it in `HfaActionsPanelComponent` avoids store pollution.
- **No milestone badge on HFA panel header**: Story 001 AC explicitly forbids a milestone-level status pill on the header; only the prereq badges are shown.
- **`markReady` emits prereqId, handler deferred**: The button is rendered and bound in this bolt; the actual `PrerequisiteService.markReady()` call is wired by Bolt 008 to stay within bolt scope.
- **Upload link as plain `<a>`**: No Angular routing involvement; opens eDocs in a new tab directly.

### Deviations from Plan

None. All deliverables implemented as specified in `implementation-plan.md`.

### Dependencies Added

None. All required packages (`@ionic/angular/standalone`, `ionicons`) were already present.

### Developer Notes

The `addIcons({ attachOutline, checkmarkOutline, chevronDownOutline })` call sits at module level outside the class — this is the Ionic pattern, not a class-level side effect. Registering the same icon from multiple files is idempotent.
