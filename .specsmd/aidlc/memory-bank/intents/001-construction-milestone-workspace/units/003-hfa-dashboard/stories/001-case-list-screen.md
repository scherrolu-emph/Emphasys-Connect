---
id: 001-case-list-screen
unit: 003-hfa-dashboard
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 001-case-list-screen

## User Story
**As an** HFA staff member
**I want** to see all active cases for my organisation on a single screen
**So that** I can quickly assess overall workload and navigate to any case

## Acceptance Criteria
- [ ] **Given** the HFA dashboard route `/dashboard` is loaded, **When** the component initialises, **Then** `CaseService.getHfaCases(hfaId)` is called and the cases signal is populated with all cases belonging to the user's HFA org
- [ ] **Given** cases are loading, **When** the data is in flight, **Then** a skeleton list (3–5 placeholder rows matching the row layout) is shown in place of the real list
- [ ] **Given** cases have loaded, **When** the list renders, **Then** each row shows: project title, a type badge (Loan / Inspection / Application), the name of the currently active milestone, and prerequisite progress as "{accepted}/{total} accepted"
- [ ] **Given** a case row is tapped, **When** the tap event fires, **Then** the app navigates to `/cases/:id` for that case
- [ ] **Given** the HFA has no active cases, **When** the list renders with an empty result, **Then** an empty-state illustration and message "No active cases" are shown instead of a list
- [ ] **Given** a viewport `<768px` (mobile), **When** the dashboard renders, **Then** the case list is full-width with compact card rows
- [ ] **Given** a viewport `768px–1279px` (tablet), **When** the dashboard renders, **Then** the case list is centred in a `max-width: 960px` container
- [ ] **Given** a viewport `≥1280px` (desktop), **When** the dashboard renders, **Then** each case row expands to a table-style layout showing title, type badge, active milestone, progress, and overdue count in distinct columns within a `max-width: 1200px` centred container

## Technical Notes
- `CaseService.getHfaCases(hfaId: string)` issues a Supabase query joining `cases`, the active `milestones` row (where `status = 'active'`), and an aggregate count of `prerequisites` grouped by `accepted_at IS NOT NULL`
- Result mapped to a typed `CaseSummary[]` interface: `{ id, title, type, activeMilestoneName, prereqAccepted, prereqTotal }`
- `cases = signal<CaseSummary[]>([])` and `isLoading = signal(true)` drive the template
- Use `IonList` + `IonItem` for native scroll behaviour; type badge is a styled `<span>` with CSS class per type
- Skeleton rows use `IonSkeletonText` inside the same `IonList` structure
- Responsive container: `.dashboard-container { max-width: 960px; margin: 0 auto }` at ≥768px; `max-width: 1200px` at ≥1280px
- Desktop table-style rows use CSS grid columns within `IonItem` — no `<table>` element

## Dependencies
### Requires
- 003-post-login-routing (unit 002)

### Enables
- 002-overdue-visual-state
- 003-type-filter-and-refresh
- 001-imc-project-picker (unit 004)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Case has no active milestone (all milestones completed) | Active milestone column shows "Completed" badge |
| Case has no prerequisites on the active milestone | Progress shown as "0/0 accepted" |
| Supabase query fails | Error state shown with "Could not load cases — pull down to retry" message |
| HFA org has more than 50 cases | List renders with virtual scroll or pagination (page size 25); out of scope for v1 — note as known limitation |

## Out of Scope
- Sorting cases (fixed order: most recently updated first)
- Archiving or closing a case from this screen
- Case search / free-text filter
