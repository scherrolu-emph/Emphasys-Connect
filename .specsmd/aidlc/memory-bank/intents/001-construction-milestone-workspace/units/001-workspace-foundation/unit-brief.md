---
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
phase: inception
status: draft
created: 2026-06-24T00:00:00Z
updated: 2026-06-24T00:00:00Z
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: Workspace Foundation

## Purpose

Establish the complete Supabase backend (schema, RLS, seed data, Edge Functions scaffold) and the Angular/Ionic app shell (routing, shell layout, singleton services). Every other unit depends on this. Nothing else can be built until the schema is live and the typed client is generated.

## Scope

### In Scope
- Supabase project setup + local dev environment (`supabase start`)
- Database schema: all tables (`hfa_orgs`, `users`, `cases`, `case_participants`, `milestones`, `prerequisites`, `conversation_messages`)
- Row Level Security policies for all tables
- Seed data: 1 imported case, 2 milestones, 3 prerequisites each, 2 user accounts (`staff@hfa.demo`, `developer@demo.com`)
- Generated TypeScript types (`supabase gen types typescript` → `database.types.ts`)
- Supabase client singleton (`lib/supabase.ts`) + Angular injection token
- `AuthService` — session management, `currentUser` signal, `is_hfa` flag access
- `RealtimeService` — `subscribeToCase(caseId)` method, channel management, `unsubscribe`
- `AppRoutingModule` (standalone routes): `/login`, `/dashboard`, `/cases/:id`
- Ionic `IonApp` + `IonRouterOutlet` shell
- Bottom tab bar (`IonTabs`): Cases tab, Profile tab
- Angular auth route guard (`authGuard`)
- Environment files (`environment.ts`, `environment.prod.ts`) excluded from git

### Out of Scope
- Auth screens (Unit 002)
- Any screen content (Units 003–007)
- @-mention or notification logic (Unit 007)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-10 | Supabase Realtime — live broadcasts for messages, prerequisites, milestones | Must |

---

## Domain Concepts

### Key Entities (all tables)
| Entity | Table | Key Columns |
|--------|-------|-------------|
| HFA Org | `hfa_orgs` | `id`, `name` |
| User | `auth.users` + custom metadata | `id`, `hfa_id`, `is_hfa`, `display_name`, `email` |
| Case | `cases` | `id`, `hfa_id`, `imc_project_id`, `title`, `status` |
| Case Participant | `case_participants` | `case_id`, `user_id`, `contact_role`, `added_by` |
| Milestone | `milestones` | `case_id`, `sequence_order`, `status` (open/active/completed) |
| Prerequisite | `prerequisites` | `milestone_id`, `prerequisite_type`, `status`, `edocs_upload_url` |
| Conversation Message | `conversation_messages` | `case_id`, `author_id`, `message_type`, `body`, `metadata` |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `AuthService.signIn(email)` | Initiates OTP flow |
| `AuthService.verifyOtp(email, token)` | Completes auth, stores session |
| `AuthService.currentUser` | Signal returning current user + `is_hfa` flag |
| `RealtimeService.subscribeToCase(caseId)` | Opens Supabase channel, returns subscription handle |
| `RealtimeService.unsubscribe(handle)` | Closes channel |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 5 |
| Must Have | 5 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | Set up Supabase project with schema and RLS | Must |
| 002 | Generate TypeScript types and Supabase client singleton | Must |
| 003 | Seed database with demo accounts, case, milestones, prerequisites | Must |
| 004 | Scaffold Angular app: routing, Ionic shell, tab bar, auth guard | Must |
| 005 | Implement RealtimeService with per-case channel subscription | Must |

---

## Dependencies

### Depends On
None — this is the foundation.

### Depended By
| Unit | Reason |
|------|--------|
| 002-auth-screens | Needs AuthService and Supabase client |
| 003-hfa-dashboard | Needs case data schema and typed client |
| 004-case-import | Needs schema for case/milestone/prerequisite writes |
| 005-case-detail-shell | Needs RealtimeService and all data types |
| 006-milestone-prereq-flow | Needs prerequisite/milestone tables and RLS |
| 007-conversation-thread | Needs conversation_messages table and RealtimeService |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Supabase | All backend services | Low — well-documented, stable |
| IMC | Seed data structure must reflect real IMC project shape | Medium — stub for hackathon |

---

## Technical Context

### Suggested Technology
- `@supabase/supabase-js` v2 — typed client
- `supabase` CLI — local dev, migrations, type generation
- Angular 17+ standalone routing (`provideRouter`)
- Ionic 7 `IonApp`, `IonRouterOutlet`, `IonTabs`, `IonTabBar`, `IonTabButton`

### Integration Points
| Integration | Type | Notes |
|-------------|------|-------|
| Supabase PostgreSQL | Direct client query | Typed via `Database` generated types |
| Supabase Auth | `supabase.auth.*` | Passwordless OTP flow |
| Supabase Realtime | `supabase.channel(...)` | Per-case channel, centralised in RealtimeService |

### Data Storage
| Data | Type | Notes |
|------|------|-------|
| All app data | PostgreSQL (Supabase) | RLS-protected |
| Auth session | Supabase default | Migrate to `@capacitor/preferences` pre-production |

---

## Constraints

- Supabase anon key must be in `environment.ts` (gitignored), never hardcoded
- RLS policies must be applied before any other unit writes data
- `hfa_id` on every table from day one — no exceptions
- Generated types must be regenerated after any schema change

---

## Success Criteria

### Functional
- [ ] `supabase start` runs locally without errors
- [ ] All 7 tables exist with correct columns and foreign keys
- [ ] RLS policies prevent cross-tenant reads
- [ ] Seed data inserts cleanly: 2 users, 1 case, 2 milestones, 3 prerequisites each
- [ ] `supabase gen types typescript` produces `database.types.ts` with all tables
- [ ] Angular app starts (`ionic serve`) and routes to `/login` without errors
- [ ] `RealtimeService.subscribeToCase` opens a channel and receives test insert

### Non-Functional
- [ ] Schema migration files committed; never modified in place
- [ ] Anon key not in any committed file

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-001-1 | S1, S2, S3 | Supabase schema, RLS, seed data, typed client |
| bolt-001-2 | S4, S5 | Angular shell, routing, AuthService, RealtimeService |
