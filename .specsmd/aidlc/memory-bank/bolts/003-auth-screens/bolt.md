---
id: '003'
unit: 002-auth-screens
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: complete
started: '2026-06-24T20:30:00Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-06-24T20:35:00Z'
    artifact: implementation-plan.md
  - name: implement
    completed: '2026-06-24T20:55:00Z'
    artifact: implementation-walkthrough.md
stories:
  - 001-email-entry-screen
  - 002-otp-entry-screen
  - 003-post-login-routing
  - 004-session-persistence-and-logout
created: '2026-06-24T00:00:00Z'
requires_bolts:
  - '002'
enables_bolts:
  - '004'
  - '005'
  - '006'
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: Full passwordless OTP flow with Supabase Auth, session persistence, and role-based post-login routing
completed: '2026-06-25T01:11:10Z'
---

# Bolt 003 — Auth Screens: Full Passwordless OTP Flow

## Objective

Implement the complete email → OTP → session auth flow using Supabase passwordless auth. After login, route HFA staff to dashboard and Developer to their case.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-email-entry-screen | Email input + OTP request | Must |
| 002-otp-entry-screen | 6-digit OTP entry + verify | Must |
| 003-post-login-routing | Role-based routing after auth | Must |
| 004-session-persistence-and-logout | Session restore + logout | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Map Supabase `signInWithOtp({ email })` call and `verifyOtp({ email, token, type: 'email' })` call
- Plan OTP screen: 6 individual character inputs (or single 6-digit input with autofocus)
- Plan `AuthService.restoreSession()` call in app initializer
- Plan post-login logic: read `user_metadata.is_hfa` → route to `/dashboard` or `/cases/:id`
- Define logout: `supabase.auth.signOut()` + clear signal + navigate to `/login`

### Stage 2: Implement
- Create `EmailEntryComponent` at `/login`: email input + "Send Code" button → calls `signInWithOtp`
- Create `OtpEntryComponent` at `/login/verify`: 6-digit input + "Verify" button → calls `verifyOtp`
- On verify success: write session to `AuthService.currentUser` signal
- Implement post-login routing in `AuthService`: check `is_hfa` → navigate
- Implement `onAuthStateChange` subscription in app initializer to restore session on reload
- Add logout action in `AuthService.signOut()`; expose in future Profile tab

### Stage 3: Test
- Enter `staff@hfa.demo` email → OTP sent (check Supabase Inbucket for local)
- Enter correct OTP → session created, navigate to `/dashboard`
- Enter incorrect OTP → error message shown, stays on verify screen
- Reload app with valid session → session restored, not redirected to login
- Logout → session cleared, redirected to `/login`
- Developer account → post-login routes to `/cases/:id` or `/empty`
