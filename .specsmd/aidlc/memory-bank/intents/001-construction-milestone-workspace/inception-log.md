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
| System Context | ✅ | system-context.md |
| Units | ✅ | units.md + 8 unit-brief.md files |
| Unit Briefs | ✅ | units/{unit-name}/unit-brief.md |
| Stories | ✅ | 29 stories across 8 units |
| Bolt Plan | ✅ | memory-bank/bolts/ (11 bolts) |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 13 |
| Non-Functional Requirements | 7 |
| Units | 10 |
| Stories | 34 |
| Bolts Planned | 13 |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| 001-workspace-foundation | 5 | 001, 002 | Critical |
| 002-auth-screens | 4 | 003 | Critical |
| 003-hfa-dashboard | 3 | 004 | High |
| 004-case-import | 4 | 005 | High |
| 005-case-detail-shell | 5 | 006 | High |
| 006-milestone-prereq-flow | 5 | 007, 008 | High |
| 007-conversation-thread | 4 | 009, 010 | High |
| 008-participant-case-list | 1 | 011 | High |
| 009-my-tasks | 1 | 012 | High |
| 010-activity-feed | 1 | 013 | High |

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
| 2026-06-24 | "Import from IMC" → "Create a case" with case type selection | User feedback: IMC import reframed as one option within a broader case creation flow; four case types: Start blank, Development Construction, Loan Underwriting, Bond Issuance | Yes |
| 2026-06-24 | "Start blank" case type added | User feedback: cases should be creatable without an IMC project; blank cases have no milestones at creation (added later via IMC or post-hackathon) | Yes |
| 2026-06-24 | IMC project list picker → text search by # or name | User feedback: a long list is not intuitive; direct search is faster; stub search filters seeded data | Yes |
| 2026-06-24 | Participant invitation included in case creation flow | User feedback: participants should be invited at creation time, not as a post-creation step | Yes |
| 2026-06-24 | "Stakeholders" → "Participants" in all UI labels | User feedback: rename all occurrences of "Stakeholders" in screens to "Participants" | Yes |
| 2026-06-24 | Participants as a dedicated tab (Actions \| Conversation \| Participants) | User feedback + mockup: Participants tab alongside Conversation in right panel; three mobile toggle tabs; grouped YOUR AGENCY / DEVELOPER / OTHER PARTICIPANTS; add/remove for HFA; read-only for others | Yes |
| 2026-06-24 | No participant management in Actions panel | "Invite Stakeholder/Participant" removed from Actions; participant management exclusively in the Participants tab | Yes |
| 2026-06-24 | "OTHER STAKEHOLDERS" → "OTHER PARTICIPANTS" in UI | Consistency with the stakeholders → participants rename | Yes |
| 2026-06-24 | `cases.reference_number` column required | Mockup shows "Lotus #MF-2024-0188" subtitle in case header; populate from IMC on import; optional field for blank cases | Yes |
| 2026-06-24 | Prerequisites collapsed by default in milestone view | User feedback: collapse all prerequisite rows; expand individually on tap | Yes |
| 2026-06-24 | Remove "Awaiting all prerequisites" pill from milestone header | User feedback: pill is redundant and adds clutter | Yes |
| 2026-06-24 | "Review & approve" / "Accept" renamed to "Approve" | User feedback: simplify button text to "Approve" | Yes |
| 2026-06-24 | Conversation composer always visible (never hidden) | User feedback: text field must always be present in the Conversations tab | Yes |
| 2026-06-24 | '@' in composer opens participant picker popup immediately | User feedback: '@' should immediately show a popup of case participants to tag | Yes |
| 2026-06-24 | New unit 009: "My Tasks" bottom-nav tab | User feedback: need a cross-case inbox showing all prerequisites requiring action from the logged-in user | Yes |
| 2026-06-24 | New unit 010: "Activity" bottom-nav tab | User feedback: need a cross-case event log (read-only) showing everything that has happened across all cases; complements My Tasks (actionable) | Yes |
| 2026-06-24 | Bottom nav tab structure confirmed | HFA: Cases \| My Tasks \| Activity; Participant: My Cases \| My Tasks \| Activity | Yes |
| 2026-06-24 | Notification bell rewritten: global, four trigger types | Bell in top-right header next to profile icon, visible all pages; triggers: @mention, tagged-in-case, assigned-to-prereq, overdue (client-side); `notifications` table required; inline panel (no modal) | Yes |
| 2026-06-24 | Overdue notifications are client-side only (hackathon) | Computed from milestone signals; not written to `notifications` table; server-side cron deferred post-hackathon | Yes |
| 2026-06-24 | IMC search applies to Development Construction only | Loan Underwriting and Bond Issuance will connect to different back-office systems long-term; for hackathon they behave like blank cases (title + case type, no imported structure); placeholder note shown on confirm screen | Yes |

## Scope Changes from v1

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| 2026-06-24 | Dropped .NET backend entirely | Supabase adopted | Backend commands removed from CLAUDE.md |
| 2026-06-24 | Dropped SignalR | Supabase Realtime replaces it | RealtimeService pattern updated |
| 2026-06-24 | Dropped 10+ personas | Hackathon scope = HFA + Developer only | Hero demo rewritten |
| 2026-06-24 | Dropped template system | IMC provides structure | Feature brief Create_Case now obsolete for hackathon |
| 2026-06-24 | Dropped severity, reassignment, cancel/archive | Not part of milestone/prereq model | Removed from standards |

## Scope Changes from pre-Checkpoint-3 review

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| 2026-06-24 | Unit 004 reworked: 3 stories → 4 stories | Create Case flow redesign: type selection + search + confirm+participants + create | +1 story, bolt 005 updated |
| 2026-06-24 | Unit 009 added: My Tasks | New cross-case task inbox requirement | +1 unit, +1 story, +1 bolt (012) |
| 2026-06-24 | Unit 010 added: Activity Feed | New cross-case event log requirement | +1 unit, +1 story, +1 bolt (013) |
| 2026-06-24 | FR-12 added | My Tasks inbox | requirements.md should be updated to add FR-12 |
| 2026-06-24 | `cases.case_type` column required | Case type selection drives structure | Unit 001 schema must include `case_type` |
| 2026-06-24 | "Start blank" case type: no IMC required | User can create a case without a linked IMC project | Blank cases have no milestones at creation |
| 2026-06-24 | Milestones are optional for blank cases | Blank case with zero milestones is a valid state; Actions panel shows "No milestones yet" (not an error); case is still usable for conversation and participants | Actions panel must handle zero-milestone state gracefully |

## Ready for Construction

**Checklist**:
- [x] Requirements documented (10 FRs, 7 NFRs)
- [x] System context defined
- [x] Units decomposed (8 units)
- [x] Stories created for all units (29 stories)
- [x] Bolts planned (11 bolts)
- [ ] Human review complete (Checkpoint 3)

## Next Steps

1. Complete Checkpoint 3 — human review of all artifacts
2. Approve to proceed to Construction phase

## Dependencies

- Supabase project must be provisioned and typed client generated before frontend services can be built
- IMC stub/seed data must be defined before Case Import can be tested end-to-end
- eDocs upload stub must be implemented before prerequisite document flow can be demoed
