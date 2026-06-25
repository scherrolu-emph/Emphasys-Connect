---
id: 005-create-case-button-position
unit: 003-hfa-dashboard
intent: 001-construction-milestone-workspace
status: complete
priority: should
created: '2026-06-25T12:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 005-create-case-button-position

## User Story

**As an** HFA staff member
**I want** the "Create a case" button to appear below the active cases list
**So that** the primary focus of the dashboard remains on existing cases, with case creation as a secondary action

## Acceptance Criteria

- [ ] **Given** the HFA dashboard, **When** it renders with existing cases, **Then** the "Create a case" button appears below the last case in the list, not at the top
- [ ] **Given** the HFA dashboard, **When** it renders with no existing cases, **Then** the "Create a case" button is the primary visible element with an empty state message above it
- [ ] **Given** the dashboard on mobile, **When** the button is below the list, **Then** it remains reachable without excessive scrolling (sticky or near-bottom placement acceptable)

## Technical Notes

- Move the "Create a case" button from its current toolbar/header position to below the `<ion-list>` of cases
- No change to the button's navigation behaviour — it still opens the create-case flow
- On mobile: consider a sticky bottom placement or a visually distinct footer row within the list

## Dependencies

### Requires
- `001-case-list-screen`

### Enables
- None (layout change only)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Very long case list | Button scrolls with the list; no fixed-position clash with tab bar |
| Empty dashboard | Button shown prominently with "No cases yet" empty state |

## Out of Scope

- Changing the create-case flow itself
- Floating action button (FAB) design — use same button style as current implementation
