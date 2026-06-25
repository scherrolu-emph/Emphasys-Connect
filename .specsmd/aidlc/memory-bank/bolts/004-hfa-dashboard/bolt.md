---
id: "004"
unit: 003-hfa-dashboard
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: complete
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
- Overdue rule: `(NOW() - milestone.activated_at) > milestone.target_days` AND `milestone.status != 'completed'` — milestone-level flag, not per-prerequisite
- Filter state: signal holding selected `case_type` value; `null` = all
- Pull-to-refresh: `IonRefresher` component → re-fetch query
- Case card/row component: title, type badge, progress bar, overdue indicator; expands to table-style columns on desktop (≥1280px) within `max-width: 1200px` centered container

### Stage 2: Implement
- Create `DashboardComponent` at `/dashboard` with `IonList` of case cards
- `DashboardStore` (Signal-based): `cases` signal, `selectedType` filter signal, `loading` signal
- Supabase query with `hfa_id` filter (from `AuthService.currentUser`)
- `CaseCardComponent` (presentational): `input()` for case data; progress bar = accepted/total prereqs
- Overdue: `computed` property on case VM — true when any `active` milestone has `activated_at` set and `(NOW() - activated_at) > target_days`; null `target_days` → never overdue
- Red left border + red badge on overdue case cards
- Filter chips above list: "All", "Construction", "Compliance", "Application" (or types from schema)
- `IonRefresher` triggers store reload

### Stage 3: Test
- Seed case appears in list with correct title and type
- Progress bar shows accepted/total prereqs for the active milestone (e.g. 1/4 when 1 is `accepted`); `received_processing` does not count toward progress
- Overdue badge shown when criteria met
- Select "Construction" filter → only construction cases shown
- Pull-to-refresh → list reloads
- HFA-only guard: Developer cannot reach `/dashboard`
