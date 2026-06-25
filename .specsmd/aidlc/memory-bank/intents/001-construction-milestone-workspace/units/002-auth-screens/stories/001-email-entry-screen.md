---
id: 001-email-entry-screen
unit: 002-auth-screens
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 001-email-entry-screen

## User Story
**As a** unauthenticated user
**I want** to enter my email address to receive a one-time passcode
**So that** I can securely log in to Emphasys Connect without managing a password

## Acceptance Criteria
- [ ] **Given** the app is launched with no active session, **When** the login screen renders, **Then** an email input field and a "Send code" button are visible
- [ ] **Given** a valid email is entered, **When** the user taps "Send code", **Then** `AuthService.signInWithOtp(email)` is called and a loading state is shown on the button
- [ ] **Given** the OTP is sent successfully, **When** the Supabase call resolves, **Then** the app navigates to the OTP entry screen passing the email as route state
- [ ] **Given** the demo quick-login buttons are tapped, **When** either `staff@hfa.demo` or `developer@demo.com` is selected, **Then** the email input is pre-filled with that address and "Send code" is triggered automatically
- [ ] **Given** the Supabase call fails (e.g., network error), **When** the error resolves, **Then** a plain-English error message is shown beneath the input and the button returns to its enabled state

## Technical Notes
- Use `IonInput` for the email field and `IonButton` for the primary CTA
- Loading state driven by an Angular Signal `isSending = signal(false)`; set to `true` before the call and `false` in the `finally` block
- `AuthService.signInWithOtp(email: string): Promise<void>` wraps `supabase.auth.signInWithOtp({ email })`
- Demo buttons are `IonButton` with `fill="outline"` styled below the main CTA; they bypass the manual input step and immediately call `signInWithOtp`
- No form library — a single reactive signal for the email value is sufficient

## Dependencies
### Requires
- None

### Enables
- 002-otp-entry-screen
- 004-session-persistence-and-logout

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User taps "Send code" with empty input | Inline validation error shown; `signInWithOtp` not called |
| User taps "Send code" with malformed email | Inline validation error shown; `signInWithOtp` not called |
| Network unavailable when "Send code" is tapped | Error message shown below input; button re-enabled |
| User navigates back from OTP screen and re-enters email | Email input is cleared; user can send a fresh OTP |

## Out of Scope
- Password-based login
- Social / OAuth login providers
- Email format validation beyond basic pattern check
- Rate limiting feedback from Supabase (handled in OTP screen story)
