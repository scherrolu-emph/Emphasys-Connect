---
id: 001-supabase-schema-and-rls
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 001-supabase-schema-and-rls

## User Story

**As a** developer
**I want** all database tables and RLS policies in place
**So that** every other unit can read and write data with correct access control from day one

## Acceptance Criteria

- [ ] **Given** Supabase local dev is running, **When** I apply migrations, **Then** all 7 tables exist: `hfa_orgs`, `auth.users` metadata, `cases`, `case_participants`, `milestones`, `prerequisites`, `conversation_messages`
- [ ] **Given** a Developer account queries `cases`, **When** they are not a participant, **Then** RLS returns 0 rows (no cross-case leaks)
- [ ] **Given** an HFA staff account queries `cases`, **When** `hfa_id` matches, **Then** only their org's cases are returned
- [ ] **Given** a Developer is a case participant, **When** they query `milestones` for that case, **Then** rows are returned correctly
- [ ] **Given** any user queries another org's data, **When** RLS is active, **Then** Supabase returns empty result, not an error

## Technical Notes

- All tables must include `hfa_id uuid NOT NULL` (except `auth.users` and `case_participants` which derive it)
- RLS must be enabled on all tables — never disabled, even for development
- Migration files committed under `supabase/migrations/`; never modify existing migrations
- Use `supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql` naming

## Dependencies

### Requires
- None (foundation story)

### Enables
- 002-typescript-types-and-client
- 003-seed-data
- All stories in units 002–007

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User not in `case_participants` queries case detail | RLS blocks, empty result |
| `hfa_id` mismatch on cases query | RLS filters to zero rows |
| Concurrent inserts to `conversation_messages` | No constraint violations |

## Out of Scope

- Supabase Edge Functions (separate story in unit 004/006)
- Realtime configuration (story 005)
