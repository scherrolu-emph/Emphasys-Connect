---
id: 005-login-page-branding
unit: 002-auth-screens
intent: 001-construction-milestone-workspace
status: draft
priority: should
created: 2026-06-25T12:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 005-login-page-branding

## User Story

**As a** user visiting the login page
**I want** to see the Emphasys branding clearly
**So that** the app feels polished and professionally attributed during the demo

## Acceptance Criteria

- [ ] **Given** the login page renders, **When** a user opens the app unauthenticated, **Then** the Emphasys HFA Software logo is displayed prominently above the login widget
- [ ] **Given** the login page renders, **When** it is displayed, **Then** a "Powered by Emphasys" message is shown below the login widget
- [ ] **Given** the login page, **When** rendered on mobile and desktop, **Then** the logo and "Powered by Emphasys" text are legible and correctly positioned at all breakpoints

## Technical Notes

- Logo: use the Emphasys HFA Software logo asset (SVG preferred); place in `src/assets/` if not already present
- "Powered by Emphasys" — small, muted caption text below the OTP/email input widget
- No structural changes to auth flow — cosmetic only

## Dependencies

### Requires
- `001-email-entry-screen`

### Enables
- None (cosmetic)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Logo asset missing | Fallback to text "Emphasys HFA Software" in brand font |
| Very small screen (320px) | Logo scales down; text wraps gracefully |

## Out of Scope

- Animated logo or splash screen
- White-labelling or dynamic logo per HFA tenant
