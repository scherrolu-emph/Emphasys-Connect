---
id: 003-import-action
unit: 004-case-import
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 003-import-action

## User Story
**As an** HFA staff member
**I want** to create a fully structured case in Emphasys Connect from an IMC project in one tap
**So that** all milestones, prerequisites, and participant records are set up correctly without manual data entry

## Acceptance Criteria
- [ ] **Given** the user taps "Import" on the confirm screen, **When** the import runs, **Then** the following rows are created atomically: one `cases` row, all `milestones` rows (Milestone 1 status `active`, remainder `open`), all `prerequisites` rows (status `pending_open`), and `case_participants` rows for the HFA staff member and the Developer identified by `developerEmail`
- [ ] **Given** the import completes successfully, **When** all writes are confirmed, **Then** a system `conversation_messages` row is written with text "Case imported from IMC: {title}" attributed to the importing HFA user
- [ ] **Given** the import succeeds, **When** navigation runs, **Then** the app navigates to the new case detail page at `/cases/{newCaseId}` using `replaceUrl: true` (import screens removed from back-stack)
- [ ] **Given** the import is in progress, **When** writes are in flight, **Then** the "Import" button is disabled and a loading spinner is shown; the user cannot double-tap
- [ ] **Given** the import fails partway through, **When** any write returns an error, **Then** no partial data is left in the database, an error message is shown, and the user remains on the confirm screen to retry

## Technical Notes
- Preferred approach: Supabase Edge Function `import-imc-project` that accepts the `ImcProject` payload and performs all inserts in a single Postgres transaction; returns `{ caseId: string }`
- Fallback (if Edge Function is not available for hackathon): `ImportService.importProject(project, hfaUserId)` performs sequential Supabase inserts; wrap in a try/catch that attempts a compensating delete of the `cases` row if a downstream insert fails
- Developer lookup: `supabase.from('profiles').select('id').eq('email', project.developerEmail).single()`; if not found, create a placeholder profile with `is_hfa: false` and the developer's email
- Developer email notification: write a log entry to `conversation_messages` (type `system`) — do not send an actual email for the hackathon build; add a TODO comment
- `case_participants` rows: one for the HFA user (`role: 'hfa'`) and one for the Developer (`role: 'developer'`)
- After successful import, `CaseService` cache should be invalidated so the new case appears on the HFA dashboard

## Dependencies
### Requires
- 002-confirm-screen
- 001-case-list-screen (unit 003) — new case must appear on dashboard post-import

### Enables
- Case detail, milestone, and conversation units (005–007)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Developer email not found in `profiles` | Placeholder profile created; import proceeds; case shows developer email as pending user |
| Duplicate import of same IMC project | Second import creates a new `cases` row with same title; no deduplication check in v1 |
| Edge Function times out | Client receives error; confirm screen shown with "Import failed — please try again" |
| HFA user loses network mid-import | Sequential insert path may leave partial data; compensating delete attempted; error shown |
| IMC project has zero milestones | Import aborted client-side with message "This project has no milestones to import" |

## Out of Scope
- Sending actual email notifications to the Developer
- Deduplication of imported projects
- Bulk import of multiple IMC projects in one action
- Editing the imported structure after creation (handled by case detail unit)
