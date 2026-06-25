# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Emphasys Connect** — a construction-milestone communication workspace for Housing Finance Agencies (HFAs) to coordinate with Developers on funded projects. Cases are imported from IMC (the back-office system); documents are stored in eDocs. Replaces email-and-spreadsheet coordination with a shared milestone/prerequisite workspace where HFA staff and the Developer can see outstanding work, exchange messages, and watch the process move live.

Full v2 design spec: [docs/design-v2/Emphasys_Connect_Design_Document.md](docs/design-v2/Emphasys_Connect_Design_Document.md)  
June 24 change request: [docs/design-v2/Emphasys_Connect_Change_Request-June24.md](docs/design-v2/Emphasys_Connect_Change_Request-June24.md)

## Stack

- **Frontend**: Ionic 8 + Angular 20 (web application, mobile-first responsive; no native app / no Capacitor)
- **Backend**: Supabase — PostgreSQL database, Auth (passwordless OTP), Realtime, Edge Functions
- **Auth**: Supabase passwordless — user enters email → receives 6-digit OTP → enters code. HFA accounts carry an `is_hfa` flag set by Emphasys IT in Supabase.
- **Real-time**: Supabase Realtime (channel subscriptions per case)
- **Integrations**: IMC (project/milestone/prerequisite import, source of truth), eDocs (document storage — upload link flow)
- **Hosting**: Azure (Emphasys-managed clients, direct DB access in v1)

## Commands

### Frontend (`/client`)
```bash
npm install               # Install dependencies
ionic serve               # Dev server (browser)
ng build                  # Production web build
ng test                   # Unit tests
ng lint                   # Lint
```

## Architecture

**Supabase is the backend.** No custom API server. Angular services call the Supabase JS client directly for data, auth, and real-time. Edge Functions handle any server-side logic (notification triggers, IMC import orchestration).

**Ionic is shell-only.** Ionic components are used exclusively for the mobile chrome (navigation, page transitions, tab bar). All content screens are plain Angular components + CSS. Avoid `IonModal`, `IonActionSheet`, `IonAlert` — use Angular overlays instead.

**Mobile-first, responsive.** Design and implement mobile-first; scale up to tablet/desktop. The two-panel HFA layout must reflow to a single column on mobile.

**IMC is the source of truth for structure.** Cases, milestones, and prerequisites are imported from IMC — never created manually in the app (hackathon scope). The app orchestrates status and communication; it does not own the underlying data model.

**eDocs owns documents.** The app never stores files. When a prerequisite is activated, the developer receives an upload link that writes to eDocs, which flips the prerequisite status in IMC.

**Two personas only (hackathon).** HFA staff and Developer. All other partner types (GC, inspector, architect, lender, etc.) are future phases.

**The conversation thread is the spine.** A single persistent thread per case mixes system-generated messages (prerequisite activations, status changes, upload confirmations) with manual HFA↔Developer messages. No folded sub-threads for the hackathon.

**Supabase Realtime is load-bearing.** The hero demo moment — Developer uploads a document and the HFA's conversation thread updates live — depends on Realtime. Never poll as a fallback in the demo build.

**Multi-tenancy is structural.** Every entity carries `hfa_id`. Row-level security is enforced via Supabase RLS policies from day one.

## Auth (hackathon)

Passwordless via Supabase. Pre-create two accounts: `staff@hfa.demo` (HFA staff, `is_hfa: true`) and `developer@demo.com` (Developer). OTP delivery may be simulated for the hackathon. Users with no cases see an empty state.

## Coding Standards

- Strict TypeScript — no `any`
- `hfa_id` on every new entity from day one
- All prerequisite/milestone status mutations must write a message to the case conversation thread in the same operation and broadcast via Supabase Realtime
- Standalone components only — no `NgModules`; every component declares its own `imports`
- `localStorage` and browser globals (`window`, `document`) are safe to use directly — web-only app
- Angular Signals for state and UI binding; RxJS only for Supabase stream adapters or multi-source composition
- Presentational components use `input()`/`output()` signals; smart components inject services via functional `inject()`
- Use `@if`/`@for (item of items; track item.id)` control flow — never `*ngIf`/`*ngFor`
- Signal values are immutable — update via `.set()` or `.update(prev => ...)`; never mutate directly
- Wrap every page in `<ion-content>`; use `<ion-list>`/`<ion-item>` for lists to preserve native scrolling
- Supabase: use typed generated client (`Database` types from `supabase gen types`); never use untyped `.from('table')` calls
- Supabase Realtime: centralise all channel subscriptions in `RealtimeService`; unsubscribe in `ngOnDestroy`
- Never expose raw Supabase row types to components — map to typed domain interfaces first

## What to Avoid

- Do not check API keys or Supabase anon keys into source control — use environment files excluded by `.gitignore`
- Do not use `IonModal` / `IonActionSheet` / `IonAlert`
- Do not poll as a fallback for Supabase Realtime updates
- Do not store files in the app — all documents route through eDocs
- Do not build case creation UI — all cases are imported from IMC for the hackathon
- Do not implement personas beyond HFA and Developer for the hackathon

## Behavioral Guidelines

1. **Verification**: Never assume functionality; verify with code scans or execution tests.
2. **Simplicity**: Prefer surgical, small file edits over global, sprawling modifications.
3. **Staged Execution**: For tasks over 10 minutes, halt and request human feedback.
4. **Code Only Focus**: Do not explain basic Angular or Supabase concepts. Provide functional, production-ready snippets directly.
5. **No Boilerplate**: Omit repetitive import blocks unless explicitly requested. Use `// ... existing imports ...` to save context space.
6. **Web-only**: This is a browser web application. Browser APIs (`localStorage`, `window`, `document`) are safe to use directly without guards.

## Development Workflow

- **Spec First**: Before coding, write a brief, one-sentence plan for approval.
- **TDD Mandatory**: Write tests *before* implementing new logic.
- **Validation**: Always run test suites and linter before marking a feature as "Done".

## Agents

The `shared-team-agents/` directory is reserved for shared agent configurations and prompts used across the team.
