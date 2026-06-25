---
stage: implement
bolt: "008"
created: 2026-06-25T14:45:00Z
---

## Implementation Walkthrough: Milestone/Prereq Flow — Mutations + Auto-Advance

### Summary

Three new singleton services handle all prerequisite and milestone mutations. `CaseDetailStore` received two immutable signal-update helpers. The HFA actions panel gained conditional action buttons with an inline return-note form. `CaseDetailPage` wires all outputs and Realtime callbacks, with optimistic updates and error rollback.

### Structure Overview

New services live in `core/cases/` alongside `case.service.ts`. The panel component emits typed event objects for each action; the page is the single orchestration point that calls services and owns the store. Realtime callbacks in the page apply the same `applyPrereqUpdate` / `applyMilestoneUpdate` helpers, de-duplicating with any optimistic update that already fired.

### Completed Work

- [x] `client/src/app/core/cases/edocs.service.ts` — stub returning deterministic URL `https://edocs.stub/{prereqId}`
- [x] `client/src/app/core/cases/milestone.service.ts` — `checkAndAdvance()`: queries all prereqs, completes milestone + activates next + inserts system message if all accepted
- [x] `client/src/app/core/cases/prerequisite.service.ts` — four mutation methods (`markReady`, `accept`, `returnWithNote`, `triggerDocumentRequest`), each updating the prerequisites row and inserting a system message; `accept` also calls `MilestoneService.checkAndAdvance`
- [x] `client/src/app/pages/case-detail/case-detail.store.ts` — added `applyPrereqUpdate()` and `applyMilestoneUpdate()`: immutably walk `caseDetail` signal, replace the target row, and rebuild `activeMilestone`
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.ts` — three typed outputs (`acceptPrereq`, `returnPrereq`, `triggerRequest`); two new signals for inline return-note form state; `openReturnNote`, `cancelReturnNote`, `confirmReturnNote` methods
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.html` — conditional action buttons per status/type; inline `<textarea>` form for Return; "Accepted ✓" read-only state
- [x] `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.scss` — return-note form styles using design tokens; action button colours updated to use `--ec-accepted`, `--ec-requested`, `--ec-accent`
- [x] `client/src/app/pages/case-detail/case-detail.page.ts` — injected `PrerequisiteService`; implemented `onMarkReady`, `onAcceptPrereq`, `onReturnPrereq`, `onTriggerRequest` (all async, optimistic update + error rollback); added `onPrerequisite` and `onMilestone` Realtime callbacks; added `findPrereq` helper
- [x] `client/src/app/pages/case-detail/case-detail.page.html` — both HFA actions panel instances (mobile + desktop) now bind all three outputs

### Key Decisions

- **No RPC, sequential writes**: `Functions: Record<string, never>` in `database.types.ts` confirms no stored procedures. System message insert is fire-and-forget after the prerequisite row update; a failure is logged but not rolled back (hackathon trade-off).
- **Optimistic update + Realtime de-dup**: the store signals update immediately on user action; the Realtime broadcast arrives ~1s later and writes the same (or authoritative) values, which is idempotent.
- **Inline note form as component state**: `returnNotePrereqId` and `returnNoteText` signals are local to `HfaActionsPanelComponent` — no store pollution for transient UI state.
- **Deterministic eDocs URL**: `https://edocs.stub/{prereqId}` uses the prereqId rather than `crypto.randomUUID()`, keeping the stub predictable across refreshes.
- **`triggerRequest` button guards `!prereq.requested`**: prevents double-triggering after an optimistic update hides the button before Realtime confirms.

### Deviations from Plan

None. All deliverables implemented as specified in `implementation-plan.md`.

### Dependencies Added

None.

### Developer Notes

The `onMarkReady` handler signature changed from `void` to `Promise<void>` — the template binds it with `(markReady)="onMarkReady($event)"` which handles async event handlers correctly in Angular.
