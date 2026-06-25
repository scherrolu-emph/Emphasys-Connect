---
id: "016"
unit: 003-hfa-dashboard
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 005-login-page-branding
  - 004-milestone-count-display
  - 005-create-case-button-position
created: 2026-06-25T12:00:00Z
started: null
completed: null
current_stage: null
stages_completed: []

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

# Bolt 016 — UI Polish: Auth + Dashboard

## Objective

Small cosmetic and UX improvements to the login page and HFA dashboard: Emphasys branding on login, milestone-count progress display, and repositioning the "Create a case" button.

> **Note**: Stories 005-login-page-branding is in unit `002-auth-screens`; the remaining stories are in unit `003-hfa-dashboard`. Both are included in this bolt for efficiency given their small scope.

## Stories in Scope

| Story | Unit | Title | Priority |
|-------|------|-------|----------|
| 005-login-page-branding | 002-auth-screens | Emphasys logo + "Powered by" on login page | Should |
| 004-milestone-count-display | 003-hfa-dashboard | Show completed milestone count (not prereq %) | Must |
| 005-create-case-button-position | 003-hfa-dashboard | Move "Create a case" below active cases | Should |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Confirm Emphasys logo asset location in `src/assets/`; determine fallback if missing
- Identify the case card component binding for progress display; plan signal/computed change
- Identify current location of "Create a case" button in HFA dashboard template

### Stage 2: Implement
- `002-auth-screens`: Add logo `<img>` above login widget; add "Powered by Emphasys" caption below widget
- `003-hfa-dashboard`: Replace prereq-% progress expression with `completedMilestones / totalMilestones` count string
- `003-hfa-dashboard`: Move "Create a case" button element below `<ion-list>` of cases; handle empty-state placement

### Stage 3: Test
- Login page: logo visible, "Powered by Emphasys" visible, responsive on mobile
- Dashboard: each case card shows "X of Y milestones completed"
- Dashboard: "Create a case" button appears below last case; appears prominently when list is empty
