---
id: "014"
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: complete
stories:
  - 005-participants-tab
created: 2026-06-25T00:00:00Z
requires_bolts: ["006"]
enables_bolts: []
requires_units: []
blocks: false
complexity:
  estimate: small
  reason: Single Edge Function + one client call; no schema changes; Gmail SMTP via denomailer (GMAIL_USER + GMAIL_PASSWORD secrets in Supabase)
---

# Bolt 014 — Participant Invitation Email

## Objective

Implement the `notify-participant-added` Edge Function to send a real invitation email when an HFA adds a participant to a case. This is a change request against Story 005 (participants-tab), which originally scoped email delivery out of the hackathon.

> **Implementation note**: Originally planned with Resend API; pivoted to Gmail SMTP via `denomailer` due to Resend free-tier domain restrictions. Uses `GMAIL_USER` and `GMAIL_PASSWORD` Supabase secrets. Post-hackathon: migrate to domain-verified transactional email (SendGrid or Resend with verified domain).

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 005-participants-tab | Real invitation email on participant add (change request) | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Edge Function `notify-participant-added`: accepts POST body `{ email, caseName, appUrl }`
- Sends via Gmail SMTP (`denomailer`); reads `GMAIL_USER` and `GMAIL_PASSWORD` from Supabase secrets
- Email: subject "You've been invited to [caseName] on Emphasys Connect"; body includes plain login link (`appUrl`)
- Client: in `addParticipant()` in `case.service.ts`, after successful `case_participants` INSERT, call `supabase.functions.invoke('notify-participant-added', { body: { ... } })` — fire-and-forget
- `appUrl` sourced from `window.location.origin`

### Stage 2: Implement
- `supabase/functions/notify-participant-added/index.ts` — Deno Edge Function using `denomailer` SMTPClient
- `case.service.ts` `addParticipant()` — fires the function after INSERT with `{ email, caseName, appUrl }`
- `auth.service.ts` `onAuthStateChange` — on `SIGNED_IN`, updates all `case_participants` rows for that email: `invite_status → 'accepted'`, `user_id → session.user.id`
- `participants-tab.component` — removed "Pending" badge; participants always shown as normal once they exist in the list

### Stage 3: Test
- HFA adds a new participant email → invitation email received within ~10 seconds
- Email shows correct case name, inviter name, and login link
- Resend failure (e.g. invalid email domain) → error logged in Edge Function logs; UI proceeds normally
- Existing `addParticipant` flow (row added, system message written) unchanged
