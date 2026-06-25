---
id: 002-typescript-types-and-client
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 002-typescript-types-and-client

## User Story

**As a** frontend developer
**I want** a typed Supabase client injectable across the Angular app
**So that** all database calls are type-safe and services never need to import `createClient` directly

## Acceptance Criteria

- [ ] **Given** the schema exists, **When** `supabase gen types typescript` runs, **Then** `src/app/lib/database.types.ts` is generated with all 7 tables typed
- [ ] **Given** `database.types.ts` exists, **When** a service writes `.from('cases')`, **Then** TypeScript infers the correct row type with no `any`
- [ ] **Given** the app boots, **When** `SupabaseService` is injected into any component, **Then** a single `SupabaseClient<Database>` instance is returned
- [ ] **Given** environment variables are missing, **When** the app boots, **Then** an error is thrown at startup (not a silent null)

## Technical Notes

- `createClient<Database>(url, anonKey)` in `src/app/lib/supabase.ts`
- Provide via Angular `InjectionToken<SupabaseClient<Database>>` in `app.config.ts`
- `environment.ts` and `environment.prod.ts` excluded in `.gitignore`
- Add `supabase gen types typescript --local > src/app/lib/database.types.ts` as an npm script

## Dependencies

### Requires
- 001-supabase-schema-and-rls

### Enables
- All service-layer stories in units 002–007

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Schema changes after types generated | Stale types cause TypeScript errors — developer must re-run gen |
| Anon key in committed file | CI lint rule or `.gitignore` must prevent this |

## Out of Scope

- Service role key (Edge Functions only)
- Realtime client configuration (story 005)
