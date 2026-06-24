---
name: system-architecture
description: System architecture for Emphasys Connect v2 — two-persona, IMC/eDocs integrations, two-panel HFA layout
metadata:
  type: reference
---

# System Architecture

## Personas (Hackathon Scope)

Two personas only:

| Persona | Account type | What they can do |
|---|---|---|
| **HFA Staff** | `is_hfa: true` | Import cases from IMC; manage milestones/prerequisites; send messages; trigger document requests; accept/reject submitted docs |
| **Developer** | Standard account | View case status (read-only); exchange messages with HFA; receive upload links; upload documents via eDocs |

All other partner types (GC, architect, inspector, lender, investor, etc.) are **future phases**.

## Case Lifecycle

```
IMC awards funding
        ↓
HFA imports project from IMC picker
        ↓
Case created in Emphasys Connect (structure mirrored from IMC)
        ↓
HFA activates first milestone → prerequisites appear
        ↓
Developer is notified (email + upload link per document prerequisite)
        ↓
Developer uploads via eDocs link → prerequisite flips to Received/Processing
        ↓
HFA reviews in IMC → Accepted or revert to Pending/Open
        ↓
When all prerequisites Accepted → milestone Completed → next milestone Opens
```

## UI Layout

### HFA View — Two panels

```
┌─────────────────────────────────┐
│  Actions Panel                  │
│  - Active milestone             │
│  - Prerequisite list + statuses │
│  - Trigger document requests    │
│  - Accept / return actions      │
│  - Manage case                  │
├─────────────────────────────────┤
│  Conversation Panel             │
│  - System messages (status      │
│    changes, upload links, etc.) │
│  - Manual HFA ↔ Developer msgs  │
│  - Message input                │
└─────────────────────────────────┘
```

On mobile (single column): Actions panel stacks above Conversation panel, with tab or toggle to switch.

### Developer View

```
┌─────────────────────────────────┐
│  Status Panel (read-only)       │
│  - Milestone progress           │
│  - Prerequisites assigned to me │
│  - Upload links                 │
├─────────────────────────────────┤
│  Conversation Panel             │
│  - Same thread as HFA view      │
│  - Message input                │
└─────────────────────────────────┘
```

Developer **cannot** trigger actions (accept, activate milestone, reassign). They respond to what the HFA initiates.

## Data Flow

### Angular → Supabase

All data access goes through the Supabase JS client. No custom REST API server.

```
Angular Service
  → supabase.from('cases').select(...)    ← typed query
  → supabase.realtime.channel('case:123') ← live subscription
  → supabase.auth.signInWithOtp(...)      ← passwordless login
  → supabase.functions.invoke(...)        ← Edge Function for complex ops
```

### Realtime

Every case has a Supabase Realtime channel (`case:{case_id}`). Clients subscribe on case open, unsubscribe on leave. Broadcasts trigger:
- New conversation message → append to thread
- Prerequisite status change → update Actions/Status panel
- Milestone status change → update milestone list

### Notifications (email)

Edge Functions send email notifications on:
1. Case created → all invited stakeholders
2. Prerequisite activated (assigned to Developer) → Developer receives email + upload link
3. Prerequisite status changes (Received → HFA notified; Accepted/Returned → Developer notified)
4. New manual message posted → counterpart notified

For the hackathon, notifications may be logged to the conversation thread without actual email delivery.

## Integration Architecture

### IMC (source of truth)

- HFA sees a picker of their IMC projects
- On import: case, milestones, and prerequisites are copied into Supabase (snapshot)
- IMC remains authoritative; the app does not push structure changes back to IMC
- Hackathon: IMC import may be **stubbed** with seeded data

### eDocs (document storage)

- App generates a signed upload URL (via Edge Function) scoped to a prerequisite
- Developer opens the URL → uploads file → file lands in eDocs
- Upload completion webhook (or polling by Edge Function) flips prerequisite to `received_processing` in Supabase and in IMC
- HFA reviews in IMC; accept/reject flows back to Supabase via IMC event or manual HFA action in app
- Hackathon: eDocs upload may be **stubbed** — a mock upload confirmation button updates the status

## Multi-tenancy

- Every entity carries `hfa_id`
- Supabase Row Level Security (RLS) policies enforced from day one (not mocked)
- Cross-case isolation: a participant on Case A cannot see Case B's data

## Security

- HFA flag (`is_hfa`) set only by Emphasys IT in Supabase dashboard — not self-serve
- RLS ensures users only read rows where they are a participant
- Supabase anon key safe for client use; service role key only in Edge Functions
- No sensitive file data in the app — eDocs handles all document storage
