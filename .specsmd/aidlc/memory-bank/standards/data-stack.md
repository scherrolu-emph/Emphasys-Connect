---
name: data-stack
description: Data model for Emphasys Connect v2 — Milestones, Prerequisites, Conversation thread
metadata:
  type: reference
---

# Data Stack

## Database

PostgreSQL via Supabase. All tables carry `hfa_id`. Row Level Security (RLS) policies enforced from day one.

## Core Entities

### `hfa_orgs`
```
id          uuid PK
name        text
created_at  timestamptz
```

### `users`
Managed by Supabase Auth (`auth.users`). Custom metadata:
```
id          uuid (auth.users.id)
hfa_id      uuid FK → hfa_orgs (null for Developer accounts)
is_hfa      boolean  — set by Emphasys IT; gates HFA-only actions
display_name text
email       text
latest_login_at timestamptz  — for future active-user billing
```

### `cases`
Imported from IMC. Never created manually in the app.
```
id              uuid PK
hfa_id          uuid FK → hfa_orgs
imc_project_id  text     — reference back to IMC project
title           text
address         text
location        text
unit_count      integer (nullable)
status          text     — active | closed
created_at      timestamptz
created_by      uuid FK → users
```

### `case_participants`
```
id              uuid PK
case_id         uuid FK → cases
user_id         uuid FK → users
contact_role    text     — e.g. Developer, Lender, Inspector (future)
added_by        uuid FK → users
added_at        timestamptz
```
The `added_by` field supports audit trail ("HFA added Developer X to this case").

### `milestones`
Imported from IMC per project. Ordered sequence.
```
id              uuid PK
case_id         uuid FK → cases
hfa_id          uuid FK → hfa_orgs
imc_milestone_id text
title           text
sequence_order  integer
target_days     integer (nullable)  — target days to completion per IMC
status          text     — open | active | completed
activated_at    timestamptz (nullable)
completed_at    timestamptz (nullable)
```
Only one milestone is `active` at a time. Completing all prerequisites → milestone `completed` → next milestone becomes `active`.

### `prerequisites`
Belong to a milestone. Imported from IMC.
```
id                  uuid PK
milestone_id        uuid FK → milestones
case_id             uuid FK → cases
hfa_id              uuid FK → hfa_orgs
imc_prereq_id       text
title               text
prerequisite_type   text  — document_submission | acceptance_comment
assigned_to         uuid FK → users (nullable — Developer account)
status              text  — pending_open | received_processing | accepted
edocs_upload_url    text (nullable)   — signed upload link, expires
edocs_document_id   text (nullable)   — eDocs reference after upload
submitted_at        timestamptz (nullable)
accepted_at         timestamptz (nullable)
notes               text (nullable)   — HFA notes on accept/return
```

### `conversation_messages`
Single thread per case. Mixes system-generated and manual messages.
```
id              uuid PK
case_id         uuid FK → cases
hfa_id          uuid FK → hfa_orgs
author_id       uuid FK → users (nullable — null = system)
message_type    text  — system | manual
body            text
metadata        jsonb (nullable)  — structured data for system messages
created_at      timestamptz
```

System message `metadata` examples:
```json
{ "event": "prerequisite_activated", "prerequisite_id": "...", "title": "Draw Request Form" }
{ "event": "prerequisite_received",  "prerequisite_id": "...", "title": "Draw Request Form" }
{ "event": "prerequisite_accepted",  "prerequisite_id": "..." }
{ "event": "milestone_completed",    "milestone_id": "...", "title": "Milestone 1" }
{ "event": "case_imported",          "imc_project_id": "..." }
```

## Status Flows

### Milestone status
```
open → active → completed
```
Only one milestone is `active` per case. Transitioning to `completed` automatically opens the next.

### Prerequisite status
```
pending_open → received_processing → accepted
     ↑                                   ↓
     └─────── (HFA rejects) ─────────────┘
```
- `pending_open`: prerequisite exists but no action taken
- `received_processing`: developer uploaded via eDocs link; HFA review in progress
- `accepted`: HFA accepted in IMC (or in app); terminal state
- Rejection reverts to `pending_open` with HFA notes

### Prerequisite type behavior
- `document_submission`: Developer receives upload link; uploads to eDocs → flips to `received_processing`
- `acceptance_comment`: No upload. Developer provides written confirmation; HFA accepts or rejects

## Overdue (cross-cutting flag)

Not stored as a status field. Computed: `milestone.target_days` exceeded AND milestone not `completed`.

## Indexes (critical for RLS + queries)

- `cases(hfa_id)`
- `case_participants(case_id, user_id)`
- `milestones(case_id, status)`
- `prerequisites(milestone_id, status)`
- `conversation_messages(case_id, created_at)`

## RLS Policy Pattern

Every table policy follows this shape:
- HFA staff (`is_hfa = true` AND `hfa_id` matches) can read/write their org's rows
- Developer participants can read rows for cases they are in (`case_participants` join)
- No cross-org reads

## Supabase Realtime

Channels are per-case: `realtime:case:{case_id}`. Tables with Realtime enabled:
- `conversation_messages` — new messages broadcast to all case participants
- `prerequisites` — status changes broadcast to case channel
- `milestones` — status changes broadcast to case channel
