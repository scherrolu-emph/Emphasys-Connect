---
unit: 002-auth-screens
intent: 001-construction-milestone-workspace
phase: inception
status: complete
created: '2026-06-24T00:00:00Z'
updated: '2026-06-24T00:00:00Z'
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: Auth Screens

## Purpose

Implement the passwordless login flow — email entry, 6-digit OTP entry, session persistence — and handle the post-login routing decision (HFA dashboard vs. Developer case view vs. empty state for users with no cases).

## Scope

### In Scope
- Email entry screen (`/login`)
- 6-digit OTP entry screen (`/login/verify`)
- "Resend code" action with cooldown
- Session restoration on app launch (stay logged in)
- Post-login routing: `is_hfa → /dashboard`, non-HFA with cases → `/cases/:id`, non-HFA with no cases → empty state
- Empty state screen for authenticated users with no case assignments
- Route guard (`authGuard`) redirecting unauthenticated users to `/login`
- "Log out" action (from Profile tab — just the action, not a full Profile page)
- Demo quick-login: two pre-fill buttons ("Log in as HFA Staff" / "Log in as Developer") for hackathon

### Out of Scope
- Registration/account creation (passwordless — any email can log in)
- Password reset (no passwords exist)
- Profile management screen (deferred)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Passwordless authentication — email → OTP → session; `is_hfa` determines UI; empty state for no cases | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Session | Supabase auth session; contains user id and JWT |
| User | `auth.users` row + `is_hfa` metadata flag |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `signInWithOtp(email)` | Triggers Supabase email OTP send |
| `verifyOtp(email, token)` | Validates code, creates session |
| `getSession()` | Restores existing session on app launch |
| `signOut()` | Clears session, routes to `/login` |
| `hasAnyCases(userId)` | Checks `case_participants` for this user — determines empty state |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 4 |
| Must Have | 4 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | Email entry screen with OTP request | Must |
| 002 | OTP entry screen with verify + resend | Must |
| 003 | Post-login routing (HFA dashboard / Developer case / empty state) | Must |
| 004 | Session persistence on app launch + logout action | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-workspace-foundation | AuthService, Supabase client, routing config, route guard |

### Depended By
| Unit | Reason |
|------|--------|
| 003-hfa-dashboard | Requires authenticated HFA session |
| 005-case-detail-shell | Requires authenticated session + user identity |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Supabase Auth | OTP generation + verification | Low |
| Email Provider | OTP delivery | Medium — use Supabase local SMTP for hackathon |

---

## Technical Context

### Suggested Technology
- `supabase.auth.signInWithOtp()` + `supabase.auth.verifyOtp()`
- Angular Signals for form state
- `@if` control flow for OTP entry phase toggle
- Ionic `IonContent`, `IonButton`, `IonInput` for input fields

### Integration Points
| Integration | Type | Notes |
|-------------|------|-------|
| Supabase Auth | Direct client call | `AuthService` wraps all calls |
| Angular Router | Navigation | Post-login routing based on `is_hfa` + case check |

---

## Constraints

- No registration form — any valid email receives an OTP
- Demo quick-login buttons must pre-fill credentials, not bypass auth (OTP still sent + verified for real demo)
- For hackathon, Supabase local SMTP is acceptable for OTP delivery

---

## Success Criteria

### Functional
- [ ] Email entry screen sends OTP and navigates to OTP screen
- [ ] Valid 6-digit code creates session and routes correctly
- [ ] Invalid code shows plain-English error, allows retry
- [ ] `is_hfa: true` user routes to `/dashboard`
- [ ] Non-HFA user with at least one case routes to that case's detail
- [ ] Non-HFA user with no cases sees the empty state
- [ ] App launch with existing session skips login
- [ ] Logout clears session and returns to `/login`

### Non-Functional
- [ ] OTP flow completes in < 30 seconds end-to-end
- [ ] Session token not stored in plain localStorage (use Supabase default for hackathon; migrate to `@capacitor/preferences` pre-production)

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-002-1 | S1, S2, S3, S4 | Full auth flow — email entry, OTP, routing, session persistence |
