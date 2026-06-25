---
id: 006-participant-list-improvements
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
status: draft
priority: should
created: 2026-06-25T12:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 006-participant-list-improvements

## User Story

**As an** HFA staff member
**I want** the participant list to show accurate invite statuses, be grouped by role, and offer a richer set of roles
**So that** I can clearly see who is involved and what their status is at a glance

## Acceptance Criteria

- [ ] **Given** a participant who has been invited but not yet logged in, **When** the participant list renders, **Then** their status badge shows "Invited" (not "Pending")
- [ ] **Given** the participant list, **When** it renders, **Then** participants are grouped by role (e.g. "HFA Staff", "Developer", "Inspector") with a visible role header for each group
- [ ] **Given** the role selector when adding a new participant, **When** it renders, **Then** available roles include at least: Developer, HFA Staff, Inspector, Lender, Architect
- [ ] **Given** any grouping, **When** a group has no participants, **Then** that group header is not shown

## Technical Notes

- Replace `invite_status === 'pending'` display label "Pending" with "Invited" — label change only, no schema change
- Group the participant list by `contact_role` — sort groups in a defined order (HFA Staff first, Developer second, then others alphabetically)
- Expand the `contact_role` enum/check constraint to include: `'inspector' | 'lender' | 'architect'` in addition to existing `'developer' | 'hfa_staff'`
- Update the role dropdown in the "Add participant" inline form to reflect expanded roles

## Dependencies

### Requires
- `005-participants-tab`

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Participant has no role set | Shown in an "Other" group at the bottom |
| All participants in the same role | Single group rendered; no visual divider confusion |

## Out of Scope

- Per-role permission controls
- Removing or reordering participants based on role
