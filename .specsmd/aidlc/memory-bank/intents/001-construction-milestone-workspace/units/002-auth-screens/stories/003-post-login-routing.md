---
id: 003-post-login-routing
unit: 002-auth-screens
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 003-post-login-routing

## User Story
**As a** newly authenticated user
**I want** to land on the correct screen automatically after login
**So that** I can immediately act on what is most relevant to my role without extra navigation

## Acceptance Criteria
- [ ] **Given** authentication succeeds and the user's profile has `is_hfa: true`, **When** post-login routing runs, **Then** the app navigates to `/dashboard`
- [ ] **Given** authentication succeeds and the user is a Developer with at least one case assignment, **When** `case_participants` is queried for the user's id, **Then** the app navigates to `/cases/{first-case-id}` (ordered by `created_at` ascending)
- [ ] **Given** authentication succeeds and the user is a Developer with zero case assignments, **When** `case_participants` returns an empty result, **Then** the app navigates to `/empty` and the screen displays a friendly message: "You'll be added to cases by your HFA"
- [ ] **Given** the user is on a protected route and their session has expired or been cleared, **When** an Angular `CanActivate` guard evaluates the route, **Then** the guard redirects to `/login`
- [ ] **Given** post-login routing is in progress, **When** the `case_participants` query is in flight, **Then** a loading indicator is shown and the previous screen is not accessible via back navigation

## Technical Notes
- Post-login routing logic lives in a standalone `PostLoginService.route(): Promise<void>` called immediately after `verifyOtp` resolves
- `AuthService.currentUser` signal exposes the Supabase `User` object; the profile row (with `is_hfa`) is fetched from `profiles` table on first access and cached in a signal
- `case_participants` query: `supabase.from('case_participants').select('case_id').eq('user_id', user.id).order('created_at').limit(1)`
- Angular `AuthGuard` (functional `canActivate`) checks `AuthService.session` signal; redirects to `/login` if null
- Use `Router.navigate` with `replaceUrl: true` so the login screens are excluded from back-stack

## Dependencies
### Requires
- 002-otp-entry-screen

### Enables
- 001-case-list-screen (unit 003)
- 001-imc-project-picker (unit 004)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Profile row missing for authenticated user | Error logged; navigate to `/empty` as safe fallback |
| `case_participants` query fails with network error | Error shown; user remains on OTP screen with retry option |
| Developer is assigned to a soft-deleted (archived) case only | Treat as zero cases; navigate to `/empty` |
| HFA user tries to access `/cases/:id` directly | Guard allows access (is_hfa users can view any case for their org) |

## Out of Scope
- Role-based permission enforcement beyond routing decisions
- Multi-org membership routing (v1 assumes one HFA per user)
- Onboarding or profile-completion flows
