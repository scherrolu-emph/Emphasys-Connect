---
id: 003-developer-panel-slots
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 003-developer-panel-slots

## User Story
**As a** Developer (external partner)
**I want** to see the correct read-only panels when viewing a case as a Developer
**So that** I can view case status without accidentally triggering HFA-only actions

## Acceptance Criteria
- [ ] **Given** an authenticated Developer user, **When** the case detail screen loads, **Then** the left panel is labelled "Status" and renders in read-only mode with no action buttons
- [ ] **Given** an authenticated Developer user, **When** the case detail screen loads, **Then** the right panel shows "Conversation" identical to the HFA conversation view
- [ ] **Given** an authenticated Developer user, **When** the case detail screen loads, **Then** the same case header and participant strip are shown as in the HFA view
- [ ] **Given** a Developer who is not a case participant, **When** they navigate to the case detail route, **Then** they are redirected away from the case

## Technical Notes
- `@if (!isHfa())` variant renders Developer-specific Status panel label
- Access check: if `case_participants` query returns 0 rows for this user, navigate to a safe route (e.g., cases list)
- RLS on the Supabase side also blocks the data query for non-participants
- No HFA-only action buttons (Accept, Return, Request Document) rendered in any slot

## Dependencies
### Requires
- `001-two-panel-layout`
### Enables
- `006/004-developer-status-panel`

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Developer is a participant on some cases but not this one | Redirected; no data exposed |
| Developer account `is_hfa` flag is incorrectly set to true | HFA layout shown; noted as a data integrity issue, not a security boundary in v1 |

## Out of Scope
- Actual Status panel content (Unit 006 story 004)
- Upload link rendering
