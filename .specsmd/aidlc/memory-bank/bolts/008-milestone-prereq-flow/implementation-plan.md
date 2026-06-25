---
stage: plan
bolt: "008"
created: 2026-06-25T14:30:00Z
---

## Implementation Plan: Milestone/Prereq Flow — Mutations + Auto-Advance

### Objective

Wire all four prerequisite mutations (`markReady`, `accept`, `returnWithNote`, `triggerDocumentRequest`) and milestone auto-advance. Each mutation writes to Supabase and inserts a system `conversation_message` (sequential, no RPC — hackathon trade-off). After any `accept`, `MilestoneService.checkAndAdvance()` inspects all prereqs for the milestone; if all accepted, it completes the milestone and activates the next. Supabase Realtime broadcasts DB changes automatically. The disabled HFA panel buttons from Bolt 007 become live; the Developer "Mark as ready" stub gets its handler.

---

### Deliverables

- `client/src/app/core/cases/prerequisite.service.ts` — `PrerequisiteService`: `markReady()`, `accept()`, `returnWithNote()`, `triggerDocumentRequest()`
- `client/src/app/core/cases/milestone.service.ts` — `MilestoneService`: `checkAndAdvance()`
- `client/src/app/core/cases/edocs.service.ts` — `EdocsService`: `generateUploadUrl()` stub
- `client/src/app/pages/case-detail/case-detail.store.ts` — add `applyPrereqUpdate()` and `applyMilestoneUpdate()` reactive mutation helpers
- `client/src/app/pages/case-detail/case-detail.page.ts` — wire `onPrerequisite` / `onMilestone` Realtime callbacks; implement all panel output handlers; inject services
- `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.ts` — add `accept`, `returnWithNote`, `triggerDocumentRequest` outputs; add inline note-input UI state signals
- `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.html` — enable action buttons per status/type; add inline note input + confirm/cancel for Return
- `client/src/app/components/hfa-actions-panel/hfa-actions-panel.component.scss` — note input field styles

---

### Dependencies

- `RealtimeService.subscribeToCase` already exposes `onPrerequisite` and `onMilestone` callbacks — no changes needed to `realtime.service.ts`
- `CaseDetailStore` already holds `caseDetail` signal and `milestones` computed — needs two new mutation helpers
- `prerequisites.upload_link` is the DB column; maps to `PrerequisiteSummary.uploadLink` in domain models
- `prerequisites.notes` stores the HFA return note
- `prerequisites.requested` flips to `true` on `triggerDocumentRequest`
- `prerequisites.returned` flips to `true` on `returnWithNote`
- `Database.Functions` is empty — no stored procs exist; sequential writes are the approach

---

### Technical Approach

**Mutation pattern** (all four methods):
1. `supabase.from('prerequisites').update({ ...changes }).eq('id', prereqId)` — throws on error
2. `supabase.from('conversation_messages').insert({ type: 'system', content: '...' })` — if this fails, log and continue (prereq status already mutated; hackathon trade-off)
3. `accept()` only: call `MilestoneService.checkAndAdvance(milestoneId, caseId, hfaId)` after the message insert

**checkAndAdvance logic**:
1. Query all `prerequisites` where `milestone_id = milestoneId`
2. If every row has `status === 'accepted'`:
   a. Update `milestones` row: `status: 'completed', completed_at: new Date().toISOString()`
   b. Find the next milestone by `order_index` (query milestones for case, find current + 1)
   c. Update next milestone: `status: 'active', activated_at: new Date().toISOString()`
   d. Insert system message: `"Milestone [title] completed. [next title] is now active."`

**EdocsService stub**: `generateUploadUrl(prereqId: string): string` returns `'https://edocs.stub/' + prereqId` — deterministic, no randomness

**CaseDetailStore mutation helpers**:
- `applyPrereqUpdate(prereqId: string, changes: Partial<PrerequisiteSummary>)`: immutably walks `caseDetail()?.milestones`, finds the milestone containing `prereqId`, replaces that prereq via spread, then `.set()` the updated `caseDetail`
- `applyMilestoneUpdate(milestoneId: string, changes: Partial<MilestoneDetail>)`: immutably replaces the matching milestone in `caseDetail()?.milestones`
- Both methods also rebuild `activeMilestone` on `caseDetail` after the update

**Realtime wiring in CaseDetailPage**:
- `onPrerequisite` callback → maps `payload.new` to `Partial<PrerequisiteSummary>` via field mapping, calls `store.applyPrereqUpdate()`
- `onMilestone` callback → maps `payload.new` to `Partial<MilestoneDetail>`, calls `store.applyMilestoneUpdate()`

**HFA panel action visibility rules** (per prereq, in expanded accordion):
- "Accept" button: visible when `prereq.status === 'received_processing'`
- "Return with note" button: visible when `prereq.status === 'received_processing'`; clicking shows inline note `<textarea>` + "Confirm return" + "Cancel" buttons (managed by `returnNotePrereqId = signal<string | null>(null)` and `returnNoteText = signal('')` on the component)
- "Trigger document request" button: visible when `prereq.type === 'document_submission' && prereq.status === 'pending_open' && !prereq.requested`

---

### Acceptance Criteria

- [ ] Developer taps "Mark as ready" on `acceptance_comment` prereq in `pending_open` → status becomes `received_processing`, system message appears in thread
- [ ] HFA taps "Accept" on `received_processing` prereq → status becomes `accepted`, system message appears
- [ ] HFA taps "Return with note" → enters note text → status reverts to `pending_open`, note stored in `prerequisites.notes`, note visible in system message
- [ ] HFA taps "Trigger document request" on `document_submission` prereq in `pending_open` → `upload_link` written, `requested: true`, system message logged, upload link visible in Developer panel
- [ ] Accepting the last prereq on the active milestone → milestone `completed`, next milestone `active`, system message "Milestone [X] completed. [Y] is now active."
- [ ] All mutations visible live in a second browser tab (Developer) without page refresh via Realtime
