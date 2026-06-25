---
stage: implement
bolt: "003"
created: 2026-06-24T20:40:00Z
---

## Implementation Walkthrough: Auth Screens (Bolt 003)

### Summary

Implemented the complete passwordless OTP auth flow: email entry, 6-digit OTP verification, role-based post-login routing, session persistence on launch, and logout. Three services handle auth concerns separately from the two page components. All routes are now wired with lazy loading and guarded.

### Structure Overview

Auth logic is split across three services in `core/auth/`: `AuthService` holds the session signal and wraps all Supabase Auth calls; `PostLoginService` owns routing decisions after successful auth; `authGuard` is a functional guard that blocks unauthenticated navigation. The two login pages (`LoginPage`, `OtpPage`) are in `pages/login/`, lazy-loaded via the router. Two placeholder pages (`DashboardPage`, `MyCasesPage`) provide routing targets for post-login navigation. `APP_INITIALIZER` in `main.ts` seeds the session signal from Supabase before the router processes any URL.

### Completed Work

- [x] `client/src/app/core/auth/auth.service.ts` — session signal, `signInWithOtp`, `verifyOtp`, `signOut`, `restoreSession`; `onAuthStateChange` subscription in constructor; `isHfa` computed
- [x] `client/src/app/core/auth/post-login.service.ts` — `route()` method: HFA → `/dashboard`, Developer → `/my-cases` with `replaceUrl: true`
- [x] `client/src/app/core/auth/auth.guard.ts` — functional `CanActivateFn`; allows if `session()` is non-null, else redirects to `/login`
- [x] `client/src/app/pages/login/login.page.ts` — email signal, validation, `sendCode()`, demo quick-login buttons
- [x] `client/src/app/pages/login/login.page.html` — email input, send button with spinner, error note, demo buttons
- [x] `client/src/app/pages/login/login.page.scss` — login container styles, error state
- [x] `client/src/app/pages/login/otp/otp.page.ts` — OTP signal, `verify()`, `resend()` with 30s countdown, `@ViewChild` auto-focus on `ionViewDidEnter`, email from `history.state`
- [x] `client/src/app/pages/login/otp/otp.page.html` — 6-digit input, verify button with spinner, resend button with cooldown countdown, error note
- [x] `client/src/app/pages/login/otp/otp.page.scss` — OTP container styles
- [x] `client/src/app/pages/dashboard/dashboard.page.ts` — HFA routing target stub
- [x] `client/src/app/pages/my-cases/my-cases.page.ts` — Developer routing target with empty state message
- [x] `client/src/app/app.routes.ts` — all routes wired: `/login`, `/login/verify`, `/dashboard` (guarded), `/my-cases` (guarded), root and wildcard redirects to `/login`
- [x] `client/src/main.ts` — `APP_INITIALIZER` calling `AuthService.restoreSession()` before first route evaluation

### Key Decisions

- **`history.state` for OTP email**: `Router.getCurrentNavigation()` returns `null` by the time Ionic's `ionViewWillEnter` fires; `history.state` is the reliable alternative and is safe for a web-only app
- **`signOut` fails open**: If `supabase.auth.signOut()` errors, the session signal is still cleared and the user is redirected — errors in sign-out should never leave the user stuck on a protected page
- **`PostLoginService` separate from `AuthService`**: Keeps routing concern out of auth concern; mirrors the story 003 spec which explicitly specifies `PostLoginService.route()`
- **Placeholder pages included in this bolt**: Required so `/dashboard` and `/my-cases` routes are resolvable and the `authGuard` redirect targets compile; they are minimal stubs to be replaced by Bolts 004 and 011

### Deviations from Plan

None. All deliverables from `implementation-plan.md` implemented as specified.

### Dependencies Added

None — all required packages (`@supabase/supabase-js`, `@ionic/angular`, Angular) were already installed by the project scaffold.

### Developer Notes

The `otp.length < 6` guard on the verify button only checks string length; Supabase will reject a wrong code with a clear error anyway. The `type="number"` input with `maxlength` does not enforce a hard 6-char cap in all browsers — the `verifyOtp` call handles actual validation server-side.
