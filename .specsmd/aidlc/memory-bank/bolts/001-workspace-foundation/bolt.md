---
id: "001"
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 001-supabase-schema-and-rls
  - 002-typescript-types-and-client
  - 003-seed-data
created: 2026-06-24T00:00:00Z
requires_bolts: []
enables_bolts: ["002"]
requires_units: []
blocks: false
complexity:
  estimate: large
  reason: Supabase project setup, schema DDL with RLS policies for all 7 tables, type generation, and seed SQL with auth user creation
---

# Bolt 001 — Workspace Foundation: Schema, Types, Seed

## Objective

Stand up the complete Supabase backend for the hackathon: schema, RLS policies, typed client, and demo seed data. All downstream bolts depend on this being correct.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-supabase-schema-and-rls | Supabase schema + RLS policies | Must |
| 002-typescript-types-and-client | Typed Supabase client singleton | Must |
| 003-seed-data | Demo accounts, case, milestones, prerequisites | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Review data-stack.md standard for all 7 tables and status enums
- Define DDL order (hfa_orgs → auth.users → cases → case_participants → milestones → prerequisites → conversation_messages)
- Map RLS policies: HFA sees all cases with matching hfa_id; participants see their case
- Plan seed: 2 auth users, 1 hfa_org, 1 case, 2 milestones, 4 prerequisites, 1 system message
- Identify npm script for `supabase gen types typescript`

### Stage 2: Implement
- Write `supabase/migrations/0001_initial_schema.sql`
- Write `supabase/seed.sql` with idempotent inserts
- Run `supabase db reset` to verify
- Run `supabase gen types typescript --local > src/app/lib/database.types.ts`
- Create `src/app/lib/supabase.ts` with `createClient<Database>`
- Wire `InjectionToken<SupabaseClient<Database>>` in `app.config.ts`

### Stage 3: Test
- Verify schema via Supabase Studio table inspector
- Verify RLS: HFA user can query cases; unauthenticated cannot
- Verify seed: run assertions against expected row counts
- Verify TypeScript: `ng build` produces no type errors on DB calls
