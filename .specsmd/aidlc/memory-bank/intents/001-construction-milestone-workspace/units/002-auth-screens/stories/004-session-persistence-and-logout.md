---
id: 004-session-persistence-and-logout
unit: 002-auth-screens
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 004-session-persistence-and-logout

## User Story
**As a** returning authenticated user
**I want** my session to persist across app restarts and to be able to log out cleanly
**So that** I am not forced to re-authenticate on every launch and can securely end my session when needed

## Acceptance Criteria
- [ ] **Given** the user has a valid existing Supabase session, **When** the app is launched, **Then** `onAuthStateChange` fires with `SIGNED_IN` before any route is evaluated and the user skips `/login` entirely
- [ ] **Given** the app launches and the stored session token is expired, **When** Supabase attempts a token refresh and it fails, **Then** the session is treated as absent and the user is sent to `/login`
- [ ] **Given** the user taps "Log out" in the Profile tab, **When** `AuthService.signOut()` is called, **Then** `supabase.auth.signOut()` is invoked, the `currentUser` and `session` signals are set to `null`, and the app navigates to `/login` with `replaceUrl: true`
- [ ] **Given** a user is logged out, **When** they try to navigate directly to any protected route (e.g. `/dashboard` or `/cases/:id`), **Then** the `AuthGuard` redirects them to `/login`
- [ ] **Given** `onAuthStateChange` emits `TOKEN_REFRESHED`, **When** the event fires, **Then** the `session` signal is updated with the new session without disrupting the current view

## Technical Notes
- `AuthService` initialises `supabase.auth.onAuthStateChange((event, session) => ...)` in its constructor; the subscription is stored and unsubscribed in `ngOnDestroy` (or as an app-level teardown if provided as a root service)
- `session = signal<Session | null>(null)` and `currentUser = computed(() => session()?.user ?? null)` drive the rest of the app's auth state
- Supabase uses its default `localStorage` persistence — this is correct and permanent for a web-only app; no migration needed
- `signOut(): Promise<void>` calls `supabase.auth.signOut()` then runs `session.set(null)`
- The app-initializer (or `APP_INITIALIZER` token) calls `supabase.auth.getSession()` on startup to seed the initial signal value before routing begins

## Dependencies
### Requires
- 001-email-entry-screen
- 003-post-login-routing

### Enables
- None (terminal story in this unit)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| `localStorage` is unavailable (private browsing) | Supabase session is in-memory only; user must re-auth on next launch; no crash |
| User logs out while a Realtime channel is open | RealtimeService must unsubscribe before `signOut()` resolves; handled by `CaseDetailPage.ionViewWillLeave` |
| App backgrounded for an extended period and session expires | On foreground, `onAuthStateChange` fires `SIGNED_OUT`; `AuthGuard` redirects to `/login` on next navigation |
| "Log out" tapped but `supabase.auth.signOut()` fails | Error logged; signals cleared anyway; user navigated to `/login` (fail-open for UX safety) |

## Out of Scope
- Token refresh retry logic (delegated to Supabase client)
- Biometric re-authentication
- Multi-account switching
