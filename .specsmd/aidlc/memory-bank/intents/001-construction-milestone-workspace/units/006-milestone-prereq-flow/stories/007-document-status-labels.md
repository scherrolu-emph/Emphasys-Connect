---
id: 007-document-status-labels
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-25T12:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 007-document-status-labels

## User Story

**As a** Developer or HFA staff member
**I want** document submission prerequisite statuses to use clear, descriptive labels
**So that** I always know exactly what action is required or what the current review state is

## Acceptance Criteria

- [ ] **Given** a prerequisite where the developer has submitted a document (DB status `received_processing`), **When** it is displayed to either the Developer or HFA, **Then** the label reads "Submitted - Under Review"
- [ ] **Given** a prerequisite that has been returned by the HFA reviewer (DB status `pending_open` after a return action), **When** it is displayed, **Then** the label reads "Deficiency" (not "Pending")
- [ ] **Given** a prerequisite that has never been submitted and is active (DB status `pending_open`, no prior return), **When** displayed, **Then** it continues to show "Pending" (awaiting first submission)
- [ ] **Given** a prerequisite that has been accepted (DB status `accepted`), **When** displayed, **Then** the label reads "Accepted" (unchanged)
- [ ] **Given** label changes, **When** applied, **Then** they appear consistently in both the HFA Actions panel and the Developer status panel

## Technical Notes

- "Deficiency" vs "Pending" requires distinguishing first-time-pending from returned-pending
- Add a `returned: boolean` flag (or `return_count: number`) to the `prerequisites` table to track whether a return has ever occurred on this prereq — OR derive from the presence of a `return` system message in `conversation_messages` for this prereq
- Display mapping:
  - `pending_open` + never returned → "Pending"
  - `pending_open` + previously returned → "Deficiency"
  - `received_processing` → "Submitted - Under Review"
  - `accepted` → "Accepted"
- Label mapping lives in a shared helper/pipe used by both HFA and Developer panels

## Dependencies

### Requires
- `002-accept-and-return-actions`
- `004-participant-status-panel`

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Return happens multiple times | Still shows "Deficiency" on subsequent returns |
| DB has no return history data | Treat as never returned → "Pending" (safe default) |

## Out of Scope

- Changing the underlying DB status values (`pending_open`, `received_processing`, `accepted`)
- Adding "Deficiency" as a separate DB status (display-layer change only, unless `returned` flag is added)
