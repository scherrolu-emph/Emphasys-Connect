---
stage: plan
bolt: 004-hfa-dashboard
created: 2026-06-24T00:00:00Z
---

## Implementation Plan: HFA Dashboard — Case List with Overdue Visuals

### Objective

Replace the stub `DashboardPage` with a fully functional HFA case list screen: Supabase query, progress indicators, overdue visual state, type filter chips, and pull-to-refresh. Scope is three stories: 001-case-list-screen, 002-overdue-visual-state, 003-type-filter-and-refresh.

### Deliverables

- `CaseSummary` domain interface (`client/src/app/core/cases/case.models.ts`)
- `CaseService` with `getHfaCases(hfaId)` (`client/src/app/core/cases/case.service.ts`)
- `hfaGuard` functional route guard (`client/src/app/core/auth/hfa.guard.ts`)
- `DashboardPage` (full replacement of stub) (`client/src/app/pages/dashboard/dashboard.page.ts` + `.html` + `.scss`)
- `CaseCardComponent` presentational component (`client/src/app/pages/dashboard/case-card/case-card.component.ts` + `.html` + `.scss`)
- `isOverdue` utility (`client/src/app/core/cases/overdue.utils.ts`)
- Route update: `/dashboard` guarded by `hfaGuard`

### Dependencies

- `AuthService.currentUser` / `isHfa` — exists in `core/auth/auth.service.ts`
- `supabase.client.ts` — exists in `core/supabase/supabase.client.ts`
- `database.types.ts` — exists; `CaseType` values are `development_construction | loan_underwriting | bond_issuance | blank`
- Ionic: `IonContent`, `IonHeader`, `IonToolbar`, `IonTitle`, `IonList`, `IonItem`, `IonChip`, `IonRefresher`, `IonRefresherContent`, `IonBadge`, `IonSkeletonText`, `IonLabel`

### Schema Adaptation Notes

**Critical**: The current `milestones` table in `database.types.ts` does not include `target_days` or `activated_at` columns — only `id, hfa_id, case_id, title, order_index, status, is_internal, created_at`. The overdue computation described in story 002 requires these columns.

**Decision**: `isOverdue()` will always return `false` in this bolt. The CSS class `case-row--overdue` and badge will be wired to the utility so they activate automatically when the schema is extended in a future bolt. This is documented as a known schema gap.

**Case type display labels**: DB values map to display labels as follows:
- `development_construction` → "Construction"
- `loan_underwriting` → "Loan"
- `bond_issuance` → "Application"
- `blank` → "General"

Filter chips: "All", "Construction", "Loan", "Application" (matching story intent with actual DB types).

### Technical Approach

1. **`CaseSummary` interface** — domain shape: `{ id, title, caseType, activeMilestoneName, prereqAccepted, prereqTotal, activeMilestoneId }`
2. **`CaseService.getHfaCases(hfaId)`** — queries `cases` joined with one `milestones` row (`status = 'active'`), plus aggregate counts of `prerequisites` where `status = 'accepted'` vs total, filtered by `hfa_id`. Maps raw rows to `CaseSummary[]`.
3. **`DashboardStore` (inlined in `DashboardPage`)** — signals: `cases`, `isLoading`, `error`, `selectedType`; computed `filteredCases`
4. **`DashboardPage`** — smart component, injects `CaseService` + `AuthService`; chip strip above `IonList`; `IonRefresher` handler; skeleton rows while loading; empty state
5. **`CaseCardComponent`** — receives `case: CaseSummary` via `input()`; emits `(selected)` output signal; renders title, type badge, milestone name, progress string, overdue badge
6. **`hfaGuard`** — checks `session() !== null && isHfa() === true`; redirects to `/login` if no session, `/my-cases` if authenticated but not HFA
7. **Responsive CSS** — `.dashboard-container` with `max-width: 960px` at ≥768px, `max-width: 1200px` at ≥1280px; desktop CSS grid columns on `IonItem`

### Acceptance Criteria

- [ ] `/dashboard` route guarded — unauthenticated → `/login`, Developer → `/my-cases`
- [ ] Cases load from Supabase on init; skeleton shown during load
- [ ] Each row shows title, type badge, active milestone name, prereq progress (e.g. "1/4 accepted")
- [ ] Empty state "No active cases" shown when result is empty
- [ ] Overdue infrastructure in place (isOverdue utility, CSS class, badge wired) — returns false until schema extended
- [ ] Filter chips "All / Construction / Loan / Application" present; selecting one filters list client-side
- [ ] Selecting "Construction" with no construction cases → "No Construction cases" empty state
- [ ] Pull-to-refresh triggers re-fetch; active filter re-applied to fresh data
- [ ] Filter selection survives route navigation (signal in component, Angular reuses instance in tab)
- [ ] Mobile: full-width list; Tablet ≥768px: max-width 960px centred; Desktop ≥1280px: table-style grid columns
- [ ] Tapping a case row navigates to `/cases/:id`
- [ ] `ng lint` passes; `ng test` passes
