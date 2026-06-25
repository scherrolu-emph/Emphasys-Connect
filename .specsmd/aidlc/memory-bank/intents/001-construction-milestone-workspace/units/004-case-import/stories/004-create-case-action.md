---
id: 004-create-case-action
unit: 004-case-import
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: "005"
implemented: true
---

# Story: 004-create-case-action

## User Story
**As an** HFA staff member
**I want** the case, milestones, prerequisites, and participants to be created in one atomic operation
**So that** the case is fully ready for work the moment I land on its detail page

## Acceptance Criteria
- [ ] **Given** the user taps "Create case" on the confirm screen for **Development Construction**, **When** the action runs, **Then** the following rows are created atomically: one `cases` row (with `case_type: 'development_construction'`), all `milestones` rows from the IMC project (Milestone 1 `active`, remainder `open`), all `prerequisites` rows (`pending_open`), and `case_participants` rows including the developer from IMC and any manually-added participants
- [ ] **Given** the user taps "Create case" for **Start blank, Loan Underwriting, or Bond Issuance**, **When** the action runs, **Then** a `cases` row is created with the appropriate `case_type` and the entered title; `case_participants` rows are created; no milestones or prerequisites are created (placeholder path for hackathon)
- [ ] **Given** the case is created successfully, **When** all writes are confirmed, **Then** a system `conversation_messages` row is written: "Case created: {title}" for blank, "Case imported from IMC: {title}" for IMC-backed
- [ ] **Given** the create succeeds, **When** navigation runs, **Then** the app navigates to the new case detail at `/cases/{newCaseId}` with `replaceUrl: true` (create-case screens removed from back-stack)
- [ ] **Given** the create is in progress, **When** writes are in flight, **Then** a full-screen loading overlay is shown; back navigation is disabled
- [ ] **Given** the create fails partway through, **When** any write returns an error, **Then** no partial data is left in the database, the loading overlay clears, and an error toast is shown; the user is returned to the confirm screen to retry

## Technical Notes
- Preferred path: Supabase Edge Function `create-case` accepts `CreateCasePayload` and runs all inserts in a single Postgres transaction; returns `{ caseId: string }`
- `CreateCasePayload`: `{ caseType: CaseType; title: string; imcProject?: ImcProject; participants: ParticipantDraft[] }`
- Participant lookup: for each `ParticipantDraft`, query `profiles` by email; if not found, create a placeholder profile
- First milestone `active`, remainder `open`; all prerequisites `pending_open`
- After success, invalidate `CaseService` cache so the new case appears on the HFA dashboard
- Participant email notification: log to `conversation_messages` (type `system`) — no actual email for hackathon; add TODO comment

## Dependencies
### Requires
- `003-confirm-and-participants`
- `003/001-case-list-screen` (unit 003) — new case must appear on dashboard post-create
### Enables
- Case detail, milestone, and conversation units (005–007)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Participant email not in `profiles` | Placeholder profile created; creation proceeds |
| Edge Function times out | Error toast shown; confirm screen restored with "Creation failed — try again" |
| HFA loses network mid-create | Sequential insert path attempts compensating delete of `cases` row; error shown |
| IMC project has zero milestones | Creation proceeds; blank milestone list; case is usable |
| Duplicate IMC project imported | New `cases` row created (same title); no deduplication in v1 |

## Out of Scope
- Sending actual email invitations to participants
- Bulk case creation
- Editing created structure in-app (milestones/prerequisites are edited in IMC)
