---
id: '008'
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: complete
started: '2026-06-25T14:30:00Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-06-25T14:35:00Z'
    artifact: implementation-plan.md
  - name: implement
    completed: '2026-06-25T14:45:00Z'
    artifact: implementation-walkthrough.md
stories:
  - 002-accept-and-return-actions
  - 003-trigger-document-request
  - 005-milestone-auto-advance
created: '2026-06-24T00:00:00Z'
requires_bolts:
  - '007'
enables_bolts:
  - '009'
requires_units: []
blocks: false
complexity:
  estimate: large
  reason: Prerequisite mutations with atomic system message writes, eDocs upload URL generation, milestone auto-advance logic — all must broadcast via Realtime
completed: '2026-06-25T14:47:55Z'
---

# Bolt 008 — Milestone/Prereq Flow: Mutations + Auto-Advance

## Objective

Wire all prerequisite mutations and milestone auto-advance. Developer side: "Mark as ready" for `acceptance_comment` prereqs (`pending_open → received_processing`). HFA side (**hackathon shortcut**): Accept and Return buttons (`received_processing → accepted / pending_open`). In v2 these HFA buttons are removed and replaced by IMC sync writing status directly to Supabase. After each mutation, write a system message atomically and let Realtime broadcast the change live.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 002-accept-and-return-actions | Accept/return mutations + system messages | Must |
| 003-trigger-document-request | Upload link generation + Developer notification | Must |
| 005-milestone-auto-advance | All prereqs accepted → milestone completes → next activates | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- **Mark as ready** (Developer, `acceptance_comment` only): `prerequisites.status = 'received_processing'` + system message "Developer marked [prereq title] as ready for review"
- **Accept** (HFA, hackathon shortcut): `prerequisites.status = 'accepted'` + system message "HFA accepted: [prereq name]"
- **Return** (HFA, hackathon shortcut): `prerequisites.status = 'pending_open'` + system message "HFA returned: [prereq name]: [note]"
- **Trigger Document Request** (`document_submission` only): generate eDocs stub URL (mock: `https://edocs.stub/{uuid}`), write to `prerequisites.edocs_upload_url`, system message "Document request sent: [prereq name]"
- **Auto-advance**: after any `accepted` write, check all prereqs for milestone — if all `accepted` → milestone `completed` + next milestone `active` + system message "Milestone [name] completed"
- All mutations: single Postgres transaction (RPC or Edge Function) to guarantee atomicity
- `PrerequisiteService` handles both HFA and Developer mutations; method names distinguish them

### Stage 2: Implement
- `PrerequisiteService` with: `markReady(prereqId)` (Developer), `accept(prereqId)` (HFA), `returnWithNote(prereqId, note)` (HFA), `triggerDocumentRequest(prereqId)` (HFA) — all async, all write system messages in same transaction
- Use Supabase RPC or Edge Function for atomic writes; fallback: sequential inserts with error rollback
- `checkMilestoneAdvance(milestoneId)`: query all prereqs, if all `accepted` → update milestone + activate next
- HFA Actions panel: "Accept" + "Return with note" buttons on `received_processing` prereqs; "Trigger Request" on `document_submission` prereqs in `pending_open`
- Participant Status panel: "Mark as ready" button on `acceptance_comment` prereqs in `pending_open` (from bolt 007 / story 004)
- Optimistic update: set signal immediately, rollback on error
- eDocs stub: `EdocsService.generateUploadUrl(prereqId)` → mock URL

### Stage 3: Test
- Developer taps "Mark as ready" on `acceptance_comment` prereq → status becomes `received_processing`, system message appears, "Under review" badge shown
- HFA taps "Accept" on `received_processing` prereq → status becomes `accepted` (green badge), system message appears
- HFA taps "Return" → reverts to `pending_open`, note visible in system message
- HFA taps "Trigger Request" on `document_submission` prereq → upload URL written, shown in Developer panel, system message logged
- Accept all prereqs in Milestone 1 → Milestone 1 `completed`, Milestone 2 `active`, system message logged
- Second browser tab (Developer) shows all state changes live via Realtime — no page refresh
- DB inspection: all writes in correct state, system messages present
