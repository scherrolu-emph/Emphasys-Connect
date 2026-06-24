---
id: 002-accept-and-return-actions
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 002-accept-and-return-actions

## User Story
**As a** HFA staff
**I want** to accept or return a prerequisite, with every action writing a system message visible to all participants
**So that** I can close out completed prerequisites and send clear feedback on returns without switching to email

## Acceptance Criteria
- [ ] **Given** a prerequisite with status `received_processing`, **When** the HFA user views the Actions panel, **Then** an "Accept" button is shown for that prerequisite
- [ ] **Given** the HFA user taps "Accept", **When** the action completes, **Then** the prerequisite status flips to `accepted`, a system message "HFA accepted [prereq title]" is written to `conversation_messages`, and the Realtime broadcast updates both HFA and Developer views
- [ ] **Given** a prerequisite with status `received_processing`, **When** the HFA user views the Actions panel, **Then** a "Return with note" button is shown for that prerequisite
- [ ] **Given** the HFA user taps "Return with note", **When** they type a note and submit, **Then** the prerequisite status reverts to `pending_open`, a system message "HFA returned [prereq title]: [note]" is written, and the return note is visible in the system message body
- [ ] **Given** a Developer user viewing the same case, **When** either action occurs, **Then** no Accept or Return buttons are rendered in their panel

## Technical Notes
- `PrerequisiteService.accept(prereqId)` and `PrerequisiteService.returnWithNote(prereqId, note)`
- Both service methods write `conversation_messages` in the same Supabase operation (use a Postgres function or sequential writes with error handling)
- Realtime update to both HFA and Developer panels handled by `CaseDetailStore` reacting to `postgres_changes`
- Inline note input shown below the "Return with note" button; submit on Enter or a "Send" button

## Dependencies
### Requires
- `001-hfa-actions-panel`
### Enables
- `005-milestone-auto-advance`

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Accept action fails (network error) | Status unchanged; error toast shown; system message not written |
| Return submitted with empty note | Blocked — submit button disabled when note input is empty |
| Prerequisite status changes via Realtime between user viewing and tapping Accept | Supabase write fails with conflict; UI refreshes from store signal |

## Out of Scope
- Document upload flow (story 003)
- Milestone auto-advance logic (story 005)
