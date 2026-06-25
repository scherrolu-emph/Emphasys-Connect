---
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
phase: inception
status: complete
created: '2026-06-24T00:00:00Z'
updated: '2026-06-24T00:00:00Z'
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: Milestone & Prerequisite Flow

## Purpose

Implements the Actions panel for HFA staff and the Status panel for Developers. Handles all milestone and prerequisite status transitions: activating milestones, triggering document requests (generating eDocs upload links), accepting/returning prerequisites, auto-advancing milestones on completion. Every status change writes a system message to the conversation thread and broadcasts via Supabase Realtime.

## Scope

### In Scope
- **Actions panel** (HFA): active milestone with prerequisite checklist, action buttons per prerequisite
- **Status panel** (Developer): read-only milestone progress + prerequisites assigned to this developer
- HFA actions:
  - "Trigger document request" → generates eDocs upload URL, flips prerequisite to `pending_open` with link, sends email notification to Developer
  - "Accept" → flips prerequisite to `accepted`; checks if all prereqs accepted → auto-completes milestone + opens next
  - "Return with note" → reverts prerequisite to `pending_open`, stores HFA note, notifies Developer
- Developer view:
  - Shows upload link for `document_submission` prerequisites in `pending_open` status
  - Shows "Accepted" / "Received — Under Review" status badges
- Milestone auto-advance: when all prerequisites of the active milestone are `accepted` → milestone `completed` → next milestone `active`
- System messages written atomically with every status change
- eDocs upload stub: "Confirm upload" mock button for hackathon (updates prerequisite to `received_processing`)

### Out of Scope
- Editing prerequisite titles/due dates (happens in IMC — app is read-only on structure)
- Conversation thread content (Unit 007)
- Creating new milestones/prerequisites in-app

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-6 | Milestone Status Flow (open → active → completed, auto-advance) | Must |
| FR-7 | Prerequisite Status Flow — Document Submission (pending_open → received_processing → accepted / revert) | Must |
| FR-8 | Prerequisite Status Flow — Acceptance Comment (written confirmation, no upload) | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Milestone | `status: open \| active \| completed`; has ordered prerequisites |
| Prerequisite (document) | `status: pending_open → received_processing → accepted`; has `edocs_upload_url` |
| Prerequisite (comment) | `status: pending_open → accepted`; no upload link |
| System Message | Written to `conversation_messages` on every transition |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `PrerequisiteService.triggerDocumentRequest(prereqId)` | Generates eDocs upload URL (stub); updates prereq; writes system message |
| `PrerequisiteService.accept(prereqId)` | Sets `status: accepted`; writes system message; checks milestone completion |
| `PrerequisiteService.returnWithNote(prereqId, note)` | Reverts to `pending_open`; stores note; writes system message; notifies developer |
| `MilestoneService.checkAndAdvance(milestoneId)` | If all prereqs accepted → complete milestone → activate next |
| `UploadStub.confirmUpload(prereqId)` | Hackathon mock: flips to `received_processing`, writes system message |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 5 |
| Must Have | 5 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | HFA Actions panel — active milestone, prerequisite checklist with status badges | Must |
| 002 | HFA accept / return-with-note actions + system message write | Must |
| 003 | Trigger document request — generate upload link, update prereq, notify developer | Must |
| 004 | Participant Status panel — milestone progress, upload links, read-only status | Must |
| 005 | Milestone auto-advance — all prereqs accepted → complete milestone → open next | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 005-case-detail-shell | `CaseDetailStore` (milestones, prerequisites signals); panel slot injection; Realtime broadcasts already wired |

### Depended By
None — terminal feature unit.

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| eDocs | Upload URL generation | Medium — stubbed for hackathon |
| Email Provider | Developer notification on trigger/accept/return | Medium — stubbed for hackathon |

---

## Technical Context

### Suggested Technology
- `PrerequisiteService` + `MilestoneService` — Supabase writes
- All mutations use Supabase transactions or Edge Functions to atomically write system messages
- Supabase Realtime broadcasts automatically from DB change (no manual push needed)
- Status badge component shared with Unit 005
- eDocs stub: Edge Function `generate-upload-url` returns a mock URL for hackathon

### Integration Points
| Integration | Type | Notes |
|-------------|------|-------|
| Supabase PostgreSQL | Write | Prerequisite/milestone status updates + conversation_messages insert |
| Supabase Realtime | Automatic | DB change → broadcast to case channel |
| eDocs (stub) | Edge Function | `generate-upload-url` — real eDocs API post-hackathon |
| Email (stub) | Edge Function | `notify-developer` — logs for hackathon |

---

## Constraints

- Every status mutation MUST write a system `conversation_message` in the same operation
- App cannot modify milestone/prerequisite titles or structure — read-only on structure
- eDocs upload stub must produce visually identical outcome to real upload

---

## Success Criteria

### Functional
- [ ] HFA Actions panel shows active milestone with prerequisites and correct status badges
- [ ] "Accept" flips prerequisite to `accepted`; system message appears in thread
- [ ] "Return with note" reverts to `pending_open` with HFA note visible; Developer notified
- [ ] "Trigger document request" generates upload link; Participant Status panel shows link
- [ ] Developer "Confirm upload" stub flips prerequisite to `received_processing`; system message appears
- [ ] When all prerequisites accepted → milestone completes → next milestone activates → system message
- [ ] All transitions broadcast via Realtime to both HFA and Developer without refresh (hero demo requirement)

### Non-Functional
- [ ] Status transition (accept/return) completes and Realtime broadcast arrives in < 1 second

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-006-1 | S1, S4 | Actions panel + Status panel rendering (read-only display with correct status badges) |
| bolt-006-2 | S2, S3, S5 | All mutations: accept, return, trigger document request, milestone auto-advance |
