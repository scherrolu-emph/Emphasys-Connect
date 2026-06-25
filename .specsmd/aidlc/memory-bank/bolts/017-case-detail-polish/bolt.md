---
id: "017"
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: completed
stories:
  - 006-participant-list-improvements
  - 007-milestone-number-badge
  - 008-case-detail-header-cleanup
created: 2026-06-25T12:00:00Z
started: 2026-06-25T22:00:00Z
completed: 2026-06-25T22:33:00Z
current_stage: null
stages_completed: ["plan", "implement", "test"]

requires_bolts: ["015"]
enables_bolts: []
requires_units: []
blocks: false

complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 1
  testing_scope: 1
---

# Bolt 017 — Case Detail Polish

## Objective

Three cosmetic and structural improvements to the case detail view: participant list labelling and grouping, milestone sequence numbers, and a cleaner case header.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 006-participant-list-improvements | "Invited" label, group by role, expanded roles | Should |
| 007-milestone-number-badge | Number badge on each milestone row | Should |
| 008-case-detail-header-cleanup | Remove Case Type & Milestone from case detail header | Should |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Identify where `invite_status` label is rendered in the participants tab component
- Confirm `contact_role` enum values and whether DB migration is needed for new roles
- Identify the milestone list template and where the number badge will be inserted
- Identify the case detail `<ion-header>` / `<ion-toolbar>` and which elements to remove

### Stage 2: Implement
- **Participant list**: Replace "Pending" label with "Invited" for `invite_status = 'pending'`; group participants by `contact_role` with role header rows; add Inspector, Lender, Architect to the role selector in the "Add participant" form; update `contact_role` check constraint if needed
- **Milestone badge**: Add a circular number badge to each milestone row in the HFA actions panel, derived from the milestone's sort order index
- **Header cleanup**: Remove Case Type chip and Active Milestone subtitle from `<ion-toolbar>`; verify case name remains

### Stage 3: Test
- Participant tab: pending invitees show "Invited"; participants grouped under role headers; all 5 roles available in add-participant form
- Case detail: each milestone row has a number badge (1, 2, 3…)
- Case detail header: shows only case name — no case type badge, no active milestone subtitle
