---
name: coding-standards
description: Coding standards for Emphasys Connect v2 — Angular/TypeScript, Supabase, Ionic
metadata:
  type: reference
---

# Coding Standards

## TypeScript

- Strict mode everywhere — no `any`, no `@ts-ignore`
- Use `unknown` and narrow types rather than casting
- All domain types defined as interfaces in `src/app/models/`; never expose raw Supabase row types to components
- `hfa_id: string` on every new domain model from day one

## Angular

- **Standalone components only** — no `NgModules`; every component declares its own `imports` array
- **Angular Signals** for all state and UI binding; RxJS only for adapting Supabase Observable streams or composing multiple sources
- Presentational components use `input()` / `output()` signals
- Smart components inject services via functional `inject()` — no constructor injection
- **Control flow**: use `@if` / `@for (item of items; track item.id)` — never `*ngIf` / `*ngFor`
- Signal values are immutable — update via `.set()` or `.update(prev => ...)`; never mutate directly

## Ionic

- Ionic is **shell-only**: `IonApp`, `IonRouterOutlet`, `IonPage`, `IonHeader`, `IonContent`, `IonToolbar`, `IonTitle`, `IonButtons`, `IonTabs`, `IonTabBar`, `IonTabButton`, `IonIcon`, `IonBadge`, `IonButton`
- All content screens are plain Angular components + CSS — no Ionic content components inside screens
- **Never use** `IonModal`, `IonActionSheet`, `IonAlert` — use Angular overlays or CSS
- Wrap every page in `<ion-content>`; use `<ion-list>` / `<ion-item>` for lists to preserve native scrolling

## Browser Storage

- `localStorage` is safe to use directly — this is a web-only application, no Capacitor native context
- For the hackathon, Supabase's default session persistence is acceptable

## Supabase

- Use generated typed client (`Database` from `supabase gen types typescript`) — never untyped `.from()`
- All Supabase calls live in services — components never import or call `supabase` directly
- Centralise all Realtime channel subscriptions in `RealtimeService`; always unsubscribe in `ngOnDestroy`
- Use `.throwOnError()` on queries so errors propagate rather than returning silent nulls
- Map raw Supabase rows to typed domain interfaces at the service boundary before returning to components

## Auth & Persona Model

- `is_hfa: boolean` on the `profiles` table is a **hackathon simplification** — it distinguishes HFA staff from all other participants with a single flag
- All non-HFA participants (Developer, GC, Inspector, Lender, etc.) are treated identically by `is_hfa: false`; persona differentiation within that group uses `case_participants.contact_role`
- When a second non-HFA persona type is added in production, `is_hfa` should be replaced with a proper role/persona field or roles table — do not extend the boolean to cover more cases
- For now: every guard and routing decision uses `AuthService.isHfa()` — do not check `contact_role` for access control in v1

## Status Mutations

Every prerequisite or milestone status change must:
1. Update the row in Supabase (within a transaction where possible)
2. Insert a system `conversation_message` for the same case in the same operation
3. The Supabase Realtime broadcast is automatic from the DB change — no manual broadcast needed

## File & Folder Structure

```
/client/src/app/
  core/           ← singleton services (AuthService, RealtimeService, CaseService…)
  models/         ← typed domain interfaces (Case, Milestone, Prerequisite, ConversationMessage…)
  pages/          ← routed page components (one folder per page)
  components/     ← shared presentational components
  lib/            ← supabase.ts client singleton, environment wrappers
```

## Naming Conventions

- Files: `kebab-case.component.ts`, `kebab-case.service.ts`, `kebab-case.model.ts`
- Interfaces: `PascalCase` (e.g. `Milestone`, `PrerequisiteStatus`)
- Supabase table constants: match DB column names exactly (snake_case) at the service layer; convert to camelCase for domain interfaces

## Comments

Default: no comments. Add a comment only when the **why** is non-obvious — a hidden constraint, a Supabase quirk, a non-obvious workaround. Never describe what the code does; well-named identifiers do that.

## Tests

- Write tests before implementing logic (TDD)
- Use `ng test` (Karma/Jasmine) for Angular unit tests
- Supabase calls in services should be tested against the Supabase local emulator (`supabase start`), not mocked
- Run linter (`ng lint`) and tests before marking any feature done
