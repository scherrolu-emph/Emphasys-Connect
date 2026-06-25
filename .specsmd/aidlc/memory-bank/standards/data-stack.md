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

### `profiles`
One row per `auth.users` entry, created via trigger on signup.
```
id            uuid PK → auth.users
hfa_id        uuid (null for Developer accounts)
email         text NOT NULL
display_name  text NOT NULL
is_hfa        boolean NOT NULL DEFAULT false
created_at    timestamptz
```

### `cases`
```
id               uuid PK
hfa_id           uuid NOT NULL
title            text NOT NULL
reference_number text (nullable)        — e.g. "Lotus #MF-2024-0188"
case_type        enum  — blank | development_construction | loan_underwriting | bond_issuance
imc_project_id   text (nullable)        — reference back to IMC project
created_by       uuid FK → profiles (nullable)
created_at       timestamptz
updated_at       timestamptz
```
> Deferred (not yet in schema): `status` (active|closed), `address`, `location`, `unit_count`

### `milestones`
```
id            uuid PK
hfa_id        uuid NOT NULL
case_id       uuid FK → cases
title         text NOT NULL
order_index   integer NOT NULL          — sequence within the case (spec name: sequence_order)
status        enum  — open | active | completed
is_internal   boolean NOT NULL DEFAULT false
target_days   integer (nullable)        — target days to completion per IMC
activated_at  timestamptz (nullable)
completed_at  timestamptz (nullable)    — written when all prereqs accepted → milestone completed
created_at    timestamptz
```
> Deferred (not yet in schema): `imc_milestone_id`

Only one milestone is `active` at a time. Completing all prerequisites → milestone `completed` → next milestone becomes `active`.

### `prerequisites`
```
id            uuid PK
hfa_id        uuid NOT NULL
case_id       uuid FK → cases
milestone_id  uuid FK → milestones
title         text NOT NULL
type          enum  — document_submission | acceptance_comment  (spec name: prerequisite_type)
status        enum  — pending_open | received_processing | accepted
requested     boolean NOT NULL DEFAULT false   — true after HFA triggers document request
returned      boolean NOT NULL DEFAULT false   — true after HFA returns for revision
owner_id      uuid FK → profiles (nullable)    — assigned Developer (spec name: assigned_to)
upload_link   text (nullable)                  — eDocs signed upload URL (spec name: edocs_upload_url)
doc_name      text (nullable)                  — eDocs document reference after upload
notes         text (nullable)                  — HFA notes written on Accept or Return
submitted_at  timestamptz (nullable)           — when Developer marked as ready
accepted_at   timestamptz (nullable)           — when HFA accepted
created_at    timestamptz
updated_at    timestamptz
```
> Deferred (not yet in schema): `imc_prereq_id`

### `case_participants`
```
id            uuid PK
hfa_id        uuid NOT NULL
case_id       uuid FK → cases
user_id       uuid FK → profiles (nullable — pending invite has no profile yet)
email         text NOT NULL
role          enum  — hfa_staff | developer
invite_status enum  — pending | accepted
source        enum  — imc | manual | creator
created_at    timestamptz
```

### `conversation_messages`
Single thread per case. Mixes system-generated and manual messages.
```
id          uuid PK
hfa_id      uuid NOT NULL
case_id     uuid FK → cases
author_id   uuid FK → profiles (nullable — null = system message)
type        enum  — system | message                (spec name: message_type)
content     text NOT NULL                           (spec name: body)
mentions    uuid[] NOT NULL DEFAULT '{}'            — user IDs @-mentioned in this message
metadata    jsonb (nullable)                        — structured data for system messages
created_at  timestamptz
```

System message `metadata` shapes:
```json
{ "event": "prerequisite_activated",  "prerequisite_id": "...", "title": "Draw Request Form" }
{ "event": "prerequisite_received",   "prerequisite_id": "...", "title": "Draw Request Form" }
{ "event": "prerequisite_accepted",   "prerequisite_id": "..." }
{ "event": "prerequisite_returned",   "prerequisite_id": "...", "notes": "..." }
{ "event": "milestone_completed",     "milestone_id": "...", "title": "Milestone 1" }
{ "event": "case_imported",           "imc_project_id": "..." }
{ "event": "participant_added",       "user_id": "...", "email": "..." }
{ "event": "participant_removed",     "user_id": "...", "email": "..." }
```

### `notifications`
```
id          uuid PK
hfa_id      uuid NOT NULL
user_id     uuid FK → profiles
case_id     uuid FK → cases (nullable)
prereq_id   uuid FK → prerequisites (nullable)   — set for 'assigned' type notifications
message_id  uuid FK → conversation_messages (nullable) — set for 'mention' type notifications
type        enum  — mention | tagged | assigned
title       text NOT NULL
body        text NOT NULL
read        boolean NOT NULL DEFAULT false        — fast filter; set true when read_at is written
read_at     timestamptz (nullable)               — timestamp the user opened the bell panel
created_at  timestamptz
```

## Status Flows

### Milestone status
```
open → active → completed
```
Only one milestone is `active` per case. Transitioning to `completed` automatically activates the next.

### Prerequisite status
```
pending_open → received_processing → accepted
     ↑                                   ↓
     └─────── (HFA returns) ─────────────┘
```
- `pending_open`: exists but no action taken
- `received_processing`: Developer submitted; HFA review in progress
- `accepted`: HFA accepted; terminal state
- Return reverts to `pending_open`; `notes` stores the HFA reason

### Prerequisite type behaviour
- `document_submission`: Developer receives upload link; uploads to eDocs → flips to `received_processing`
- `acceptance_comment`: No upload. Developer confirms in-app; HFA accepts or returns

## Overdue (cross-cutting flag)

Not stored as a status. Computed client-side:
`milestone.target_days` is non-null AND `milestone.activated_at + target_days < now()` AND `milestone.status != 'completed'`

## Indexes

- `cases(hfa_id)`
- `case_participants(case_id, user_id)`, `case_participants(email)`
- `milestones(case_id)`, `milestones(activated_at)` (partial, not null)
- `prerequisites(case_id)`, `prerequisites(milestone_id)`, `prerequisites(owner_id)` (partial, not null)
- `conversation_messages(case_id)`, `conversation_messages(created_at)`
- `notifications(user_id)`, `notifications(case_id)`, `notifications(prereq_id)` (partial, not null)
- `notifications(user_id, created_at DESC)` partial WHERE `read_at IS NULL` — unread fast path

## RLS Policy Pattern

- HFA staff (`is_hfa = true` AND `hfa_id` matches) can read/write their org's rows
- Participants can read rows for cases they appear in via `case_participants`
- Notifications: user sees only their own rows (`user_id = auth.uid()`)

## Supabase Realtime

Channels are per-case: `realtime:case:{case_id}`. Tables with Realtime enabled:
- `conversation_messages` — new messages broadcast to all case participants
- `prerequisites` — status changes broadcast to case channel
- `milestones` — status changes broadcast to case channel
- `case_participants` — add/remove broadcast to case channel
- `notifications` — per-user subscription for bell badge updates
