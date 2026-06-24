---
intent: 001-construction-milestone-workspace
phase: inception
status: units-defined
updated: 2026-06-24T00:00:00Z
---

# Units: Construction Milestone Workspace

## Summary

| Metric | Count |
|--------|-------|
| Total Units | 10 |
| Frontend Feature Units | 10 |
| Backend Service Units | 0 (Supabase BaaS — schema + RLS in Unit 001) |

## Requirement-to-Unit Mapping

| FR | Requirement | Unit |
|----|-------------|------|
| FR-1 | Passwordless Authentication + Participant post-login routing | `002-auth-screens`, `008-participant-case-list` |
| FR-2 | HFA Dashboard — Case List | `003-hfa-dashboard` |
| FR-3 | Create Case — type selection, IMC project search, confirm + participants, atomic create | `004-case-import` |
| FR-4 | Case Detail — HFA Two-Panel View | `005-case-detail-shell` |
| FR-5 | Case Detail — Participant View | `005-case-detail-shell` |
| FR-6 | Milestone Status Flow | `006-milestone-prereq-flow` |
| FR-7 | Prerequisite Status Flow — Document Submission | `006-milestone-prereq-flow` |
| FR-8 | Prerequisite Status Flow — Acceptance Comment | `006-milestone-prereq-flow` |
| FR-9 | Manual Messaging (HFA ↔ Participant) | `007-conversation-thread` |
| FR-10 | Supabase Realtime — Live Thread Updates | `001-workspace-foundation` |
| FR-11 | @-Mentions and Notification Bell | `007-conversation-thread` |
| FR-12 | My Tasks — cross-case prerequisite inbox for logged-in user | `009-my-tasks` |
| FR-13 | Activity Feed — cross-case event log for logged-in user | `010-activity-feed` |

## Units

| # | Unit | Purpose | Dependencies | FRs |
|---|------|---------|--------------|-----|
| 001 | `workspace-foundation` | Supabase schema + RLS + seed data, Angular app shell, routing, Ionic shell, AuthService, RealtimeService | None | FR-10 |
| 002 | `auth-screens` | Passwordless OTP screens, session guards, empty state | 001 | FR-1 |
| 003 | `hfa-dashboard` | Case list screen, overdue indicators, type filter | 001, 002 | FR-2 |
| 004 | `case-import` | Create Case flow: type selection, IMC search, confirm + participants, atomic create | 001, 002, 003 | FR-3 |
| 005 | `case-detail-shell` | Two-panel case detail layout, HFA/Participant variants, mobile reflow, milestone progress + prereq list rendering, participants drilldown | 001, 002 | FR-4, FR-5 |
| 006 | `milestone-prereq-flow` | Milestone/prereq status transitions, upload link generation, approve/return actions, system message writes | 005 | FR-6, FR-7, FR-8 |
| 007 | `conversation-thread` | Thread rendering, manual message composer (always visible), @-mention participant popup, notification bell, Realtime subscription | 005 | FR-9, FR-11 |
| 008 | `participant-case-list` | Participant home screen at `/my-cases` — case list, empty state, post-login entry point for all non-HFA participants | 001, 002 | FR-1, FR-5 |
| 009 | `my-tasks` | "My Tasks" bottom-nav tab (tab 2) — cross-case prerequisite inbox for logged-in user with case + milestone context, live badge count | 001, 002, 006 | FR-12 |
| 010 | `activity-feed` | "Activity" bottom-nav tab (tab 3) — cross-case event log, newest first, Realtime prepend, deep link to case | 001, 002, 007 | FR-13 |

## Dependency Graph

```
001-workspace-foundation
        │
        ├──► 002-auth-screens
        │           │
        │           ├──► 003-hfa-dashboard ──► 004-case-import
        │           │
        │           ├──► 008-participant-case-list
        │           │
        │           └──► 005-case-detail-shell
        │                       │
        │                       ├──► 006-milestone-prereq-flow ──► 009-my-tasks
        │                       │
        │                       └──► 007-conversation-thread ──► 010-activity-feed
```

## Build Order (hackathon recommended)

**Dev 1 path**: 001 → 004 (create case + schema) → 006 (milestone/prereq actions) → 009 (my tasks)  
**Dev 2 path**: 002 (auth) → 003 (dashboard) + 008 (participant case list) → 005 (case detail shell) → 007 (conversation thread) → 010 (activity feed)

Sync point: after Unit 001 is complete (shared Supabase schema + types). Ensure `case_type` column is added to `cases` table during Unit 001.
