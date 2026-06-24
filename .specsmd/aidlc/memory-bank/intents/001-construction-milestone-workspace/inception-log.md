---
intent: 001-construction-milestone-workspace
created: 2026-06-24T00:00:00Z
completed: null
status: in-progress
---

# Inception Log: 001-construction-milestone-workspace

## Overview

**Intent**: Construction milestone workspace — HFA Dashboard, Case Import from IMC, Two-Panel Case Detail (Actions + Conversation), Prerequisite/Milestone status flow, Supabase Realtime live updates, Developer view.
**Type**: green-field
**Created**: 2026-06-24

## Context

This intent was created from a fresh start after a major design pivot on June 24, 2026. The original intent (`001-case-workspace-item-checklist`, archived in `memory-bank-v1/`) was based on a .NET backend, 10+ personas, and a flat item checklist. The new design centers on Supabase, two personas (HFA + Developer), and a Milestones → Prerequisites data model imported from IMC.

See change request: [docs/design-v2/Emphasys_Connect_Change_Request-June24.md](../../../../../docs/design-v2/Emphasys_Connect_Change_Request-June24.md)

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | ✅ | requirements.md |
| Units | [ ] | units/ |
| Unit Briefs | [ ] | units/{unit-name}/unit-brief.md |
| Stories | [ ] | units/{unit-name}/stories/*.md |
| Bolt Plan | [ ] | memory-bank/bolts/ |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 10 |
| Non-Functional Requirements | 7 |
| Units | TBD |
| Stories | TBD |
| Bolts Planned | TBD |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| TBD — defined during units skill | — | — | — |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-06-24 | Fresh start — archive v1 memory bank | Design pivot too deep to update in place; stack, data model, personas all changed | Yes |
| 2026-06-24 | Supabase replaces .NET + EF Core + SQL Server + SignalR | Team chose Supabase in June 24 session for auth, DB, real-time; Azure-hosted for Emphasys clients | Yes |
| 2026-06-24 | Two personas only: HFA + Developer | Hackathon scope hard-narrowed; all other partner types deferred to future phases | Yes |
| 2026-06-24 | Cases imported from IMC, no in-app creation | IMC is source of truth; case creation triggered by funding award in IMC | Yes |
| 2026-06-24 | Conversation thread is fully flat | One stream per case; system events + manual messages interleaved; no sub-threads, no folding onto specific prerequisites | Yes |
| 2026-06-24 | Full draw package shelved | Hackathon uses simpler IMC milestone/prerequisite model; 10-doc draw cycle with multiple partners is a future phase | Yes |
| 2026-06-24 | App is read/orchestrate only — no structural edits | Prerequisite/milestone titles, due dates, and assignments are edited in IMC; app reflects IMC state | Yes |
| 2026-06-24 | @-mentions + notification bell kept (simplified) | @-mention triggers email notification via Edge Function; bell shows unread count; low effort with Supabase Realtime already wired | Yes |
| 2026-06-24 | Milestones → Prerequisites replaces flat item checklist | Reflects real HFA construction draw workflow; statuses simplified to pending_open / received_processing / accepted | Yes |
| 2026-06-24 | Templates removed entirely | Structure now comes from IMC per project; template system no longer needed | Yes |

## Scope Changes from v1

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| 2026-06-24 | Dropped .NET backend entirely | Supabase adopted | Backend commands removed from CLAUDE.md |
| 2026-06-24 | Dropped SignalR | Supabase Realtime replaces it | RealtimeService pattern updated |
| 2026-06-24 | Dropped 10+ personas | Hackathon scope = HFA + Developer only | Hero demo rewritten |
| 2026-06-24 | Dropped template system | IMC provides structure | Feature brief Create_Case now obsolete for hackathon |
| 2026-06-24 | Dropped severity, reassignment, cancel/archive | Not part of milestone/prereq model | Removed from standards |

## Ready for Construction

**Checklist**:
- [x] Requirements documented (10 FRs, 7 NFRs)
- [ ] System context defined
- [ ] Units decomposed
- [ ] Stories created for all units
- [ ] Bolts planned
- [ ] Human review complete

## Next Steps

1. Resolve open questions (see requirements.md)
2. Decompose into units
3. Create stories per unit
4. Plan construction bolts

## Dependencies

- Supabase project must be provisioned and typed client generated before frontend services can be built
- IMC stub/seed data must be defined before Case Import can be tested end-to-end
- eDocs upload stub must be implemented before prerequisite document flow can be demoed
