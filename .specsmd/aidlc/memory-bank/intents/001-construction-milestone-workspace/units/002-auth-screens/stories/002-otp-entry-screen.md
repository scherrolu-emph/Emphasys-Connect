---
id: 002-otp-entry-screen
unit: 002-auth-screens
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 002-otp-entry-screen

## User Story
**As a** user who received an OTP email
**I want** to enter my 6-digit code to complete authentication
**So that** I am granted a valid session and can access my cases

## Acceptance Criteria
- [ ] **Given** the OTP screen loads, **When** the component initialises, **Then** a 6-digit numeric input is auto-focused and the email address sent to is shown as confirmation text
- [ ] **Given** a valid 6-digit code is entered and submitted, **When** `AuthService.verifyOtp(email, token)` succeeds, **Then** a Supabase session is created and post-login routing is triggered
- [ ] **Given** an invalid or expired code is submitted, **When** `verifyOtp` returns an error, **Then** a plain-English error message is displayed (e.g. "Invalid or expired code — please try again") and the input is cleared for retry
- [ ] **Given** the user taps "Resend code", **When** the button is in its enabled state, **Then** `signInWithOtp` is called again and a 30-second cooldown timer is started; the button is disabled for the duration
- [ ] **Given** a loading state is active, **When** either submit or resend is in flight, **Then** the active button shows a spinner and all inputs are disabled until the call resolves

## Technical Notes
- `AuthService.verifyOtp(email: string, token: string): Promise<void>` wraps `supabase.auth.verifyOtp({ email, token, type: 'email' })`
- Use a single `IonInput` with `type="number"` and `maxlength="6"`; apply `autofocus` attribute via Angular template ref on `ionViewDidEnter`
- Cooldown timer implemented with `setInterval` stored in a signal `resendCooldown = signal(0)`; decrement each second; button re-enables when value reaches 0
- Email passed from previous screen via Angular Router `extras.state`; store in a local signal on component init
- Loading state signal: `isVerifying = signal(false)` toggled around the `verifyOtp` call

## Dependencies
### Requires
- 001-email-entry-screen

### Enables
- 003-post-login-routing

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User pastes a 6-digit code | Paste is accepted; submit proceeds normally |
| User submits fewer than 6 digits | Inline validation error shown; `verifyOtp` not called |
| User hits "Resend code" during cooldown | Button is disabled; no action taken |
| Session already exists when screen loads | Guard redirects to post-login route before screen renders |
| Supabase returns rate-limit error on resend | Error message shown; cooldown timer still starts |

## Out of Scope
- SMS OTP delivery
- TOTP / authenticator app support
- Splitting the 6 digits into individual input boxes
