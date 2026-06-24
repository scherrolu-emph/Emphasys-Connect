---
id: 004-angular-app-shell
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 004-angular-app-shell

## User Story

**As a** user
**I want** a working app shell with navigation and route protection
**So that** I land on the correct screen and cannot access protected routes without authentication

## Acceptance Criteria

- [ ] **Given** the app launches unauthenticated, **When** I navigate to any protected route, **Then** I am redirected to `/login`
- [ ] **Given** I am authenticated as HFA, **When** the app boots, **Then** I land on `/dashboard`
- [ ] **Given** I am authenticated as Developer, **When** the app boots, **Then** I land on `/cases/:id` (my case) or the empty state
- [ ] **Given** the app is running, **When** I look at the bottom of the screen, **Then** a tab bar shows "Cases" and "Profile" tabs
- [ ] **Given** I tap the "Cases" tab, **When** I am HFA, **Then** I navigate to `/dashboard`
- [ ] **Given** `ionic serve` runs, **When** I open the browser, **Then** no console errors on initial load

## Technical Notes

- Standalone routing via `provideRouter()` in `app.config.ts`
- Routes: `/login`, `/login/verify`, `/dashboard` (HFA guard), `/cases/:id`, `/empty`
- `authGuard` using `inject(AuthService).currentUser` signal — functional guard
- Bottom tab bar: Ionic `IonTabs`, `IonTabBar`, `IonTabButton`
- `IonApp` + `IonRouterOutlet` as root component

## Dependencies

### Requires
- 002-typescript-types-and-client (SupabaseService available)

### Enables
- 002-auth-screens (uses `/login` route)
- 003-hfa-dashboard (uses `/dashboard` route)
- 005-case-detail-shell (uses `/cases/:id` route)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Developer tries to access `/dashboard` | `authGuard` checks `is_hfa`; redirects to case or empty state |
| Deep link to `/cases/:id` without session | Redirected to `/login`, then back after auth |

## Out of Scope

- Profile page content (tab shows, content deferred)
- Push notification routing
