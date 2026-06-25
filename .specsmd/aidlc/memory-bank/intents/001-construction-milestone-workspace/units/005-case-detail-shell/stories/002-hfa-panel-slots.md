---
id: 002-hfa-panel-slots
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 002-hfa-panel-slots

## User Story
**As a** HFA staff
**I want** to see the correct panel containers when viewing a case as HFA staff
**So that** I can immediately orient to the Actions and Conversation areas specific to my role

## Acceptance Criteria
- [ ] **Given** an authenticated user with `is_hfa: true`, **When** the case detail screen loads, **Then** the left panel is labelled "Actions" with a placeholder until Unit 006 is built
- [ ] **Given** an authenticated user with `is_hfa: true`, **When** the case detail screen loads, **Then** the right panel shows "Conversation" placeholder until Unit 007 is built
- [ ] **Given** the case detail screen, **When** rendered for an HFA user, **Then** the case header shows project title, type badge, and active milestone name
- [ ] **Given** the case detail screen, **When** rendered for an HFA user, **Then** the case header shows: case title (bold), reference number subtitle (e.g. "Lotus #MF-2024-0188"), case type badge, and active milestone name
- [ ] **Given** the case detail screen, **When** rendered for an HFA user, **Then** participant information is accessible via the **Participants tab** (story 005) — there is no participant strip or drilldown in the case header

## Technical Notes
- `@if (isHfa())` structural rendering to show HFA-specific panel labels
- `CaseDetailStore` provides case metadata signals
- Case header: `case.title`, `case.referenceNumber`, `case.caseType`, active milestone name from `milestones` signal
- Placeholder `<div>` with "Actions panel loading…" text until Unit 006 component is injected
- Schema note: `cases.reference_number TEXT` — populated from IMC on import; optional for blank cases

## Dependencies
### Requires
- `001-two-panel-layout`
### Enables
- Unit 006 stories

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Case has no active milestone | Header shows "No active milestone" |
| Case has no participants yet | Participants section shows "No participants added" |
| Participant has no profile yet (pending invite) | Shows email address + "Pending" badge instead of display name |

## Out of Scope
- Actual Actions panel content (Unit 006)
- Conversation panel content (Unit 007)
