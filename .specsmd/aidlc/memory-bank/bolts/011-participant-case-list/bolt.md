---
id: "011"
unit: 008-participant-case-list
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: complete
stories:
  - 001-participant-case-list-screen
created: 2026-06-24T00:00:00Z
requires_bolts: ["003"]
enables_bolts: ["006"]
requires_units: []
blocks: false
complexity:
  estimate: small
  reason: Single screen with one Supabase query; simpler than the HFA dashboard — no overdue logic, no filter chips
---

# Bolt 011 — Participant Case List

## Objective

Build the participant home screen at `/my-cases`: a simple list of cases the signed-in user is a participant in, with active milestone name and prerequisite progress. Includes empty state, loading skeleton, route guard (redirect HFA to `/dashboard`), and responsive layout.

Named and built persona-agnostically — works for Developer (hackathon) and any future partner type (GC, Lender, Inspector, etc.) without code changes.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-participant-case-list-screen | Participant case list — data fetch, row rendering, empty state, navigation | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Route: add `/my-cases` to app routing; lazy-loaded `ParticipantCasesComponent`
- Route guard: `canActivate` — if `AuthService.isHfa()` → redirect `/dashboard`; else allow
- Query: `case_participants` where `user_id = currentUser.id` → join `cases` → join active `milestones` (status `active`) → left join `prerequisites` aggregate counts
- `ParticipantCaseSummary` interface: `{ id, title, activeMilestoneName: string | null, prereqAccepted: number, prereqTotal: number }`
- `CaseService.getParticipantCases(userId)` (extend existing `CaseService` — don't create a new service)
- Responsive container CSS: same max-width breakpoints as HFA dashboard (`960px` at tablet, `1200px` at desktop)
- Update `PostLoginService.route()`: non-HFA path routes to `/my-cases`

### Stage 2: Implement
- Add `/my-cases` route to `app.routes.ts` with `ParticipantCasesGuard`
- `ParticipantCasesComponent`: standalone, `IonPage` + `IonContent` + `IonList`
- `cases = signal<ParticipantCaseSummary[]>([])`, `isLoading = signal(true)` — loaded on `ngOnInit`
- Call `CaseService.getParticipantCases(userId)` and populate signal
- `@for (case of cases(); track case.id)` → `IonItem` row: title + milestone name + progress text
- `@if (cases().length === 0 && !isLoading())` → empty state: "You'll be added to cases by your HFA"
- `IonSkeletonText` rows shown while `isLoading()` is true
- Tap row → `Router.navigate(['/cases', case.id])`
- Update `PostLoginService`: non-HFA path navigates to `/my-cases`
- Responsive CSS: `.participant-cases-container { max-width: 960px; margin: 0 auto }` at ≥768px; `max-width: 1200px` at ≥1280px

### Stage 3: Test
- Developer login → lands on `/my-cases`
- Seed case row shows correct title, milestone name, progress "0/4 accepted"
- Tap case row → navigates to `/cases/:id`
- HFA user navigates to `/my-cases` → redirected to `/dashboard`
- Empty state: remove seed `case_participants` row → "You'll be added to cases by your HFA" shown
- Responsive: three viewports render correct layouts per ux-guide breakpoints
