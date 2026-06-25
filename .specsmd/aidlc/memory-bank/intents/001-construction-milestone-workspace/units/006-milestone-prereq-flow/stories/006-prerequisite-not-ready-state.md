---
id: 006-prerequisite-not-ready-state
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-25T12:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 006-prerequisite-not-ready-state

## User Story

**As an** HFA staff member or Developer
**I want** prerequisites that cannot yet be worked on to be clearly labelled "Not Ready"
**So that** I immediately know which items are blocked and which are actionable

## Acceptance Criteria

- [ ] **Given** a prerequisite that belongs to a non-active milestone (milestone status is `open` or `completed`), **When** it is displayed in the prerequisite list, **Then** its status shows "Not Ready" instead of its underlying DB status
- [ ] **Given** a "Not Ready" prerequisite, **When** rendered in the HFA Actions panel, **Then** no action buttons (Trigger, Approve, Return) are shown for it
- [ ] **Given** a "Not Ready" prerequisite in the Developer's status panel, **When** rendered, **Then** no upload link is shown and the item is visually de-emphasised (e.g. muted/greyed)
- [ ] **Given** a milestone becomes active (prior milestone completes), **When** the Realtime update arrives, **Then** all its prerequisites transition away from "Not Ready" to their actual underlying status without page refresh

## Technical Notes

- "Not Ready" is a display-only state — no new DB column needed
- Derive it in the component/store: `if (milestone.status !== 'active') → displayStatus = 'Not Ready'`
- Apply to both HFA Actions panel and Developer status panel
- Ensure Realtime milestone status updates trigger re-evaluation of display status via the existing `CaseDetailStore`

## Dependencies

### Requires
- `001-hfa-actions-panel`
- `004-participant-status-panel`
- `005-milestone-auto-advance`

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| All milestones are completed | All prerequisites show their real status (none are "Not Ready") |
| Active milestone has a prerequisite with status `accepted` | Shows "Accepted", not "Not Ready" (milestone is active) |

## Out of Scope

- Hiding "Not Ready" prerequisites entirely (they remain visible but non-actionable)
- Adding a "Not Ready" status value to the database schema
