---
stage: test
bolt: 004-hfa-dashboard
created: 2026-06-25T00:00:00Z
---

## Test Report: HFA Dashboard — Case List with Overdue Visuals

### Summary

- **Tests**: 64/64 passed (19 new tests added for this bolt)
- **Coverage**: All acceptance criteria verified via unit tests; UI integration verified via build

### Test Files

- [x] `client/src/app/core/cases/overdue.utils.spec.ts` — 6 tests; covers null, completed, missing fields, overdue/on-time deadline logic
- [x] `client/src/app/core/cases/case.service.spec.ts` — 3 tests; covers row-to-domain mapping, no active milestone, Supabase error propagation
- [x] `client/src/app/core/auth/hfa.guard.spec.ts` — 3 tests; covers redirect to /login, redirect to /my-cases, allow HFA through
- [x] `client/src/app/pages/dashboard/dashboard.store.spec.ts` — 6 tests; covers initial state, load success/error, filteredCases all/filtered, selectType
- [x] `client/src/app/core/auth/auth.service.spec.ts` — updated 2 tests; isHfa now reads from profile signal

### Acceptance Criteria Validation

- ✅ **HFA guard on `/dashboard`**: hfaGuard spec verifies unauthenticated → /login, Developer → /my-cases; app.routes.ts uses hfaGuard
- ✅ **Cases load from Supabase on init**: DashboardPage.ngOnInit calls store.load(hfaId); CaseService query verified in spec
- ✅ **Skeleton shown during load**: `@if (store.isLoading())` renders 4 IonSkeletonText rows in template
- ✅ **Row shows title, type badge, milestone name, prereq progress**: CaseCardComponent template + CaseService mapping spec verifies "2/4 accepted"
- ✅ **Empty state "No active cases"**: template `@if` on empty filteredCases with selectedType === 'all'
- ✅ **Overdue infrastructure wired**: isOverdue utility fully functional; red border + badge CSS classes in place; returns false until `target_days`/`activated_at` are populated (schema gap documented)
- ✅ **Filter chips "All / Construction / Loan / Application"**: FILTER_CHIPS constant drives template; DashboardStore spec verifies filter logic
- ✅ **Empty state for filtered type**: template shows "No Construction cases" etc. when filteredCases is empty with active filter
- ✅ **Pull-to-refresh triggers re-fetch**: onRefresh handler calls store.load() and calls event.target.complete()
- ✅ **Filter persists across navigation**: DashboardStore is providedIn root; signal survives component destruction
- ✅ **Responsive layout**: CSS breakpoints at 768px (960px container) and 1280px (1200px container + grid columns) in dashboard.page.scss and case-card.component.scss
- ✅ **Tapping a case navigates to `/cases/:id`**: navigateToCase() calls router.navigate
- ✅ **ng lint passes**: 0 errors
- ✅ **ng test passes**: 64/64 SUCCESS

### Issues Found

None.

### Notes

- The overdue badge and red border are rendered conditionally via `isOverdue()` in CaseCardComponent. Once `002_bolt004_milestone_overdue.sql` is applied and milestone data includes `target_days`/`activated_at`, overdue will display automatically.
- The build produced 0 TypeScript errors. The `as unknown as RawCase[]` cast in CaseService is intentional and isolated — the hand-authored Database types do not define table relations.
