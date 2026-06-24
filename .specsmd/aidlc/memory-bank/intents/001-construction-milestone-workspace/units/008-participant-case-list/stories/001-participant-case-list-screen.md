---
id: 001-participant-case-list-screen
unit: 008-participant-case-list
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 001-participant-case-list-screen

## User Story
**As a** case participant (Developer for the hackathon; any partner type in production)
**I want** to see all cases I have been added to on a single screen
**So that** I can navigate to any of my active projects without the HFA having to send me a direct link

## Acceptance Criteria
- [ ] **Given** a non-HFA user is authenticated, **When** post-login routing completes, **Then** the app navigates to `/my-cases`
- [ ] **Given** the `/my-cases` screen loads, **When** the component initialises, **Then** `CaseService.getParticipantCases(userId)` is called and the cases signal is populated with all cases where the user appears in `case_participants`
- [ ] **Given** cases have loaded, **When** the list renders, **Then** each row shows: project title, active milestone name, and prerequisite progress as "{accepted}/{total} accepted"
- [ ] **Given** a case row is tapped, **When** the tap event fires, **Then** the app navigates to `/cases/:id` for that case
- [ ] **Given** the participant has no assigned cases, **When** the list renders with an empty result, **Then** an empty state is shown with the message "You'll be added to cases by your HFA" and no list is rendered
- [ ] **Given** cases are loading, **When** the query is in flight, **Then** a skeleton list (2–3 placeholder rows) is shown
- [ ] **Given** an HFA user navigates to `/my-cases`, **When** the route guard evaluates, **Then** the guard redirects to `/dashboard`
- [ ] **Given** a viewport `<768px` (mobile), **When** the screen renders, **Then** the case list is full-width with compact card rows
- [ ] **Given** a viewport `768px–1279px` (tablet), **When** the screen renders, **Then** the list is centred in a `max-width: 960px` container
- [ ] **Given** a viewport `≥1280px` (desktop), **When** the screen renders, **Then** each row expands to a table-style layout showing title and milestone in distinct columns within a `max-width: 1200px` centred container

## Technical Notes
- `CaseService.getParticipantCases(userId: string)` — Supabase query: `case_participants` → `cases` left join active `milestones` (status = `active`) left join `prerequisites` aggregate (count / accepted count)
- Result mapped to `ParticipantCaseSummary[]`: `{ id, title, activeMilestoneName: string | null, prereqAccepted: number, prereqTotal: number }`
- `cases = signal<ParticipantCaseSummary[]>([])` and `isLoading = signal(true)` drive the template
- Route guard: `canActivate` checks `isHfa()` — HFA users redirected to `/dashboard`; all other authenticated users land here
- `ParticipantCasesComponent` (not `DeveloperCasesComponent`) — name is persona-agnostic
- Use `IonList` + `IonItem` for native scroll; skeleton uses `IonSkeletonText`
- Responsive container CSS: `max-width: 960px` at ≥768px; `max-width: 1200px` at ≥1280px

## Dependencies
### Requires
- `003-post-login-routing` (unit 002) — routes non-HFA users to `/my-cases`
- `001-workspace-foundation` (unit 001) — `case_participants` + `cases` typed client

### Enables
- `001-two-panel-layout` (unit 005) — participants reach case detail from this screen

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Case has no active milestone (all completed) | Active milestone shown as "All milestones complete" |
| Case has no prerequisites on the active milestone | Progress shown as "0/0 accepted" |
| Supabase query fails | Error state shown with "Could not load cases — pull down to retry" |
| Participant is in `case_participants` for a case but the case row is missing | Row silently omitted; no crash |

## Out of Scope
- Overdue indicators (HFA-only)
- Type filter
- Import from IMC action
- Persona-specific filtering of cases by `contact_role` (future — v1 shows all cases for the user)
