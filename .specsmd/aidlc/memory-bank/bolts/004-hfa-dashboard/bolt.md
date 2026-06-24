---
id: "004"
unit: 003-hfa-dashboard
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 001-case-list-screen
  - 002-overdue-visual-state
  - 003-type-filter-and-refresh
created: 2026-06-24T00:00:00Z
requires_bolts: ["003"]
enables_bolts: ["005"]
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: Case list with Supabase query, overdue calculation, progress indicators, filter chips, and pull-to-refresh
---

# Bolt 004 — HFA Dashboard: Case List with Overdue Visuals

## Objective

Build the HFA dashboard case list screen showing all cases with progress indicators, overdue highlighting, type filter chips, and pull-to-refresh.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-case-list-screen | Case list with progress indicators | Must |
| 002-overdue-visual-state | Red badge + border for overdue cases | Must |
| 003-type-filter-and-refresh | Type filter chips + pull-to-refresh | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Query: `cases` joined with `milestones` aggregates → accepted prereq count / total prereq count
- Overdue rule: any `active` milestone has at least one `pending_open` prereq past due date (or: case has no activity in N days — confirm from design spec)
- Filter state: signal holding selected `case_type` value; `null` = all
- Pull-to-refresh: `IonRefresher` component → re-fetch query
- Case card component: title, type badge, progress bar, overdue indicator

### Stage 2: Implement
- Create `DashboardComponent` at `/dashboard` with `IonList` of case cards
- `DashboardStore` (Signal-based): `cases` signal, `selectedType` filter signal, `loading` signal
- Supabase query with `hfa_id` filter (from `AuthService.currentUser`)
- `CaseCardComponent` (presentational): `input()` for case data; progress bar = accepted/total prereqs
- Overdue: compute from `milestones` — `active` milestone with a `pending_open` prereq older than threshold
- Red left border + red badge on overdue case cards
- Filter chips above list: "All", "Construction", "Compliance", "Application" (or types from schema)
- `IonRefresher` triggers store reload

### Stage 3: Test
- Seed case appears in list with correct title and type
- Progress bar shows 1/4 (one prereq in `received_processing` counts toward accepted — confirm logic)
- Overdue badge shown when criteria met
- Select "Construction" filter → only construction cases shown
- Pull-to-refresh → list reloads
- HFA-only guard: Developer cannot reach `/dashboard`
