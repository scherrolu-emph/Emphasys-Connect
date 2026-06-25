---
stage: test
bolt: "003"
created: 2026-06-24T21:10:00Z
---

## Test Report: Auth Screens (Bolt 003)

### Summary

- **Tests**: 37/37 passed
- **Coverage**: All acceptance criteria verified

### Test Files

- [x] `src/app/core/auth/auth.service.spec.ts` — session signal, restoreSession, signInWithOtp, verifyOtp, signOut (fail-open), isHfa computed
- [x] `src/app/core/auth/auth.guard.spec.ts` — allows authenticated sessions, redirects unauthenticated to /login
- [x] `src/app/pages/login/login.page.spec.ts` — email validation, sendCode success/failure, quickLogin password bypass
- [x] `src/app/pages/login/otp/otp.page.spec.ts` — history.state email, verify success/failure, OTP clearing on error, resend cooldown countdown, cooldown guard
- [x] `src/app/app.component.spec.ts` — scaffold test fixed (standalone import + provideRouter)

### Acceptance Criteria Validation

- ✅ **App launches with no session → /login**: authGuard returns `parseUrl('/login')` when session is null (guard spec)
- ✅ **Valid email → signInWithOtp called, navigate to /login/verify**: LoginPage sendCode spec
- ✅ **Demo quick-login → signInWithPassword + PostLoginService.route()**: LoginPage quickLogin spec
- ✅ **Correct OTP → verifyOtp called, PostLoginService.route()**: OtpPage verify spec
- ✅ **Wrong OTP → error shown, input cleared**: OtpPage verify failure spec
- ✅ **Resend code → signInWithOtp called, 30s cooldown starts**: OtpPage resend spec
- ✅ **Cooldown active → resend no-ops**: OtpPage cooldown guard spec
- ✅ **Reload with valid session → session seeded before routing**: AuthService restoreSession spec
- ✅ **Logout clears session and navigates to /login**: AuthService signOut spec
- ✅ **Logout fails-open on network error**: AuthService signOut failure spec
- ✅ **ng build clean**: verified in Stage 2 (zero TypeScript errors)
- ✅ **ng lint clean**: verified in Stage 2 (all files pass)

### Issues Found

None.

### Notes

- `console.error` output during the signOut-fails-open and sendCode-error tests is expected behaviour — the service logs errors intentionally before clearing state.
- The `app.component.spec.ts` scaffold had two pre-existing bugs (wrong `declarations` vs `imports`, missing `provideRouter`) that were fixed as part of this stage.
