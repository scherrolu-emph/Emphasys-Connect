---
id: "008"
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 002-accept-and-return-actions
  - 003-trigger-document-request
  - 005-milestone-auto-advance
created: 2026-06-24T00:00:00Z
requires_bolts: ["007"]
enables_bolts: ["009"]
requires_units: []
blocks: false
complexity:
  estimate: large
  reason: Prerequisite mutations with atomic system message writes, eDocs upload URL generation, milestone auto-advance logic — all must broadcast via Realtime
---

# Bolt 008 — Milestone/Prereq Flow: Mutations + Auto-Advance

## Objective

Wire all HFA prerequisite mutations: Accept, Return, and Trigger Document Request (upload link generation). After each mutation, write a system message atomically and let Realtime broadcast the change live. Implement milestone auto-advance when all prerequisites are accepted.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 002-accept-and-return-actions | Accept/return mutations + system messages | Must |
| 003-trigger-document-request | Upload link generation + Developer notification | Must |
| 005-milestone-auto-advance | All prereqs accepted → milestone completes → next activates | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Accept: `prerequisites.status = 'accepted'` + insert system message "HFA accepted: {prereq name}"
- Return: `prerequisites.status = 'pending_open'` + insert system message "HFA returned: {prereq name}"
- Trigger Document Request: generate eDocs stub upload URL (mock: `https://edocs.stub/{uuid}`), write to `prerequisites.upload_url`, insert system message "Document request sent: {prereq name}"
- Auto-advance: after any `accepted` write, check if all prerequisites for current milestone are `accepted` → if yes, set milestone `status = 'completed'` + next milestone `status = 'active'` + insert system message "Milestone {name} completed"
- All mutations: single Postgres transaction (DB function or Edge Function) to guarantee atomicity

### Stage 2: Implement
- `PrereqMutationService` with `accept(prereqId)`, `return(prereqId)`, `triggerDocumentRequest(prereqId)` — all async, all write system messages in same transaction
- Use Supabase RPC or Edge Function for atomic writes; fallback: sequential inserts with error rollback
- Auto-advance logic in `checkMilestoneAdvance(milestoneId)`: query all prereqs for milestone, if all `accepted` → update milestone + activate next
- Add "Accept" button and "Return" button to `HfaActionsPanelComponent` prereq rows (from bolt 007)
- "Trigger Request" button for `document_submission` prereqs in `pending_open` state
- Optimistic update: set signal immediately, rollback on error
- eDocs stub: `EdocsService.generateUploadUrl(prereqId)` → returns mock URL

### Stage 3: Test
- Click "Accept" on prereq → status changes to `accepted` (green badge), system message appears in thread
- Click "Return" on `accepted` prereq → reverts to `pending_open`, system message logged
- Click "Trigger Request" → upload URL written, shown in Developer panel, system message logged
- Accept all prereqs in Milestone 1 → Milestone 1 status becomes `completed`, Milestone 2 becomes `active`
- Second browser tab (Developer) shows same state changes live via Realtime — no page refresh
- DB inspection: all writes in correct state, system messages present
