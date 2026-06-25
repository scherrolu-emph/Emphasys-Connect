---
stage: plan
bolt: "003"
created: 2026-06-24T20:30:00Z
---

## Implementation Plan: Auth Screens (Bolt 003)

### Objective

Implement the complete passwordless OTP auth flow: email entry → OTP entry → session creation → role-based routing. Includes session persistence on app launch and logout.

### Deliverables

- `AuthService` — session signal, `signInWithOtp`, `verifyOtp`, `signOut`, `onAuthStateChange` subscription, `isHfa` computed
- `PostLoginService` — route decision after successful auth
- `authGuard` — functional CanActivate guard, redirects unauthenticated to `/login`
- `EmailEntryPage` (`/login`) — email input, "Send code", demo quick-login buttons, error state
- `OtpEntryPage` (`/login/verify`) — single 6-digit input, auto-focus, "Verify", "Resend code" with 30s cooldown, error state
- `DashboardPage` placeholder (`/dashboard`) — guarded, minimal stub for HFA routing target
- `MyCasesPage` placeholder (`/my-cases`) — guarded, empty state message for Developers
- Updated `app.routes.ts` — all routes with lazy loading and auth guards
- Updated `main.ts` — `APP_INITIALIZER` to restore session before routing

### Dependencies

- `supabase` singleton: `client/src/app/core/supabase/supabase.client.ts` (exists)
- `@supabase/supabase-js` `Session`, `User`, `AuthChangeEvent` types
- Angular Router (`Router`, `CanActivateFn`, `inject`)
- Angular Signals (`signal`, `computed`)
- `APP_INITIALIZER` injection token
- Ionic: `IonPage`, `IonHeader`, `IonContent`, `IonToolbar`, `IonTitle`, `IonInput`, `IonButton`, `IonSpinner`, `IonLabel`

### Technical Approach

**State management**: All auth state lives in `AuthService` as signals. `session = signal<Session | null>(null)` is the single source of truth. `currentUser` and `isHfa` are derived `computed` signals. Components never hold auth state directly.

**Session restore**: `APP_INITIALIZER` calls `supabase.auth.getSession()` and seeds `session` signal before the router processes the first URL. `onAuthStateChange` keeps the signal updated for token refresh and logout events.

**Routing**: `PostLoginService.route()` is called once after `verifyOtp` resolves. HFA → `/dashboard`, Developer → `/my-cases`. Both use `replaceUrl: true` to remove login screens from back-stack. The `authGuard` uses `inject(AuthService).session()` — null means redirect to `/login`.

**OTP screen**: Email passed from login page via `router.getCurrentNavigation()?.extras.state`. Resend cooldown uses `setInterval` stored in component (cleared on destroy). Auto-focus applied on `ionViewDidEnter` lifecycle hook.

**Placeholder pages**: Dashboard and My Cases stubs exist only to give routing a target for this bolt. They will be replaced by real implementations in Bolts 004 and 011.

### Acceptance Criteria

- [ ] App launches with no session → shows `/login` (email entry screen)
- [ ] Enter valid email → "Send code" triggers `signInWithOtp`, navigates to `/login/verify`
- [ ] Demo quick-login buttons pre-fill email and auto-trigger send
- [ ] Enter correct 6-digit OTP → session created; `is_hfa: true` user routes to `/dashboard`; non-HFA routes to `/my-cases`
- [ ] Enter wrong OTP → plain-English error shown; input clears for retry
- [ ] "Resend code" → `signInWithOtp` called again; button disabled for 30 seconds
- [ ] Reload app with valid session → skips `/login`, routes directly to correct destination
- [ ] Expired/absent session on reload → shown `/login`
- [ ] "Log out" → session cleared, navigated to `/login` (replaceUrl)
- [ ] Navigate to `/dashboard` or `/my-cases` unauthenticated → `authGuard` redirects to `/login`
- [ ] `ng build` produces zero TypeScript errors
- [ ] `ng lint` passes clean
