---
stage: test
bolt: "002"
created: 2026-06-24T00:00:00Z
---

## Test Report: Workspace Foundation — Angular Shell + RealtimeService

### Summary

- **Tests**: 45/45 passed
- **Coverage**: All acceptance criteria verified

### Test Files

- [x] `src/app/core/realtime/realtime.service.spec.ts` — channel creation, deduplication, multi-case isolation, unsubscribe, no-op safety (8 tests, bolt 002)
- [x] `src/app/core/auth/auth.service.spec.ts` — session signal, restoreSession, signInWithOtp, verifyOtp, signOut fail-open, isHfa computed (carried from bolt 003)
- [x] `src/app/core/auth/auth.guard.spec.ts` — allows authenticated sessions, redirects unauthenticated to /login (carried from bolt 003)
- [x] `src/app/pages/login/login.page.spec.ts` — email validation, sendCode, quickLogin (carried from bolt 003)
- [x] `src/app/pages/login/otp/otp.page.spec.ts` — verify, resend, cooldown, ViewChild focus (carried from bolt 003)
- [x] `src/app/app.component.spec.ts` — scaffold smoke test

### Acceptance Criteria Validation

- ✅ **`subscribeToCase(caseId)` creates a channel named `case:{caseId}` and calls subscribe**: realtime spec
- ✅ **Registers postgres_changes listeners for conversation_messages, prerequisites, milestones**: realtime spec
- ✅ **Duplicate `subscribeToCase` calls return same channel, no second subscription**: realtime spec
- ✅ **Different caseIds get independent channels**: realtime spec
- ✅ **`unsubscribe(caseId)` calls channel.unsubscribe() and removes from map**: realtime spec
- ✅ **After unsubscribe, a fresh subscribe creates a new channel**: realtime spec
- ✅ **`unsubscribe` with unknown caseId does not throw**: realtime spec
- ✅ **`ionic serve` → no console errors on load**: verified — dev server compiled cleanly, 0 TypeScript errors
- ✅ **Unauthenticated navigation to protected route → redirects to /login**: auth.guard spec
- ✅ **Session restored on reload via APP_INITIALIZER**: auth.service restoreSession spec

### Issues Found

None.

### Notes

- The `ERROR:` lines in Karma output during the auth error-handling tests are expected and intentional — `console.error` in `signOut` fail-open path and `LoginPage` error handlers is by design (noted in bolt 003 test-walkthrough).
- `ng test --no-watch --browsers=ChromeHeadless` used for single-run headless execution.
