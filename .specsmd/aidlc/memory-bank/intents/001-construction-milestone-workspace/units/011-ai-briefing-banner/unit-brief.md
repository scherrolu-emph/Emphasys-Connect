---
unit: 011-ai-briefing-banner
intent: 001-construction-milestone-workspace
phase: construction
status: complete
created: '2026-06-25T00:00:00Z'
updated: '2026-06-25T00:00:00Z'
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: AI Briefing Banner

## Purpose

A role-aware AI-powered catch-up banner that appears at the top of each persona's home screen on every page load. It streams a pre-written summary of recent activity using a typewriter effect, then surfaces 2–3 action chips pointing to the most urgent items. Designed to give HFA staff and Developers an immediate, zero-navigation overview of what needs their attention — and to serve as the hackathon demo's hero AI moment.

## Scope

### In Scope
- `AiBriefingService` — visibility signal, dummy data, typewriter streaming via `setInterval`
- `AiBriefingBannerComponent` — streaming text panel with skeleton loader, blinking cursor, action chips, dismiss button
- Integration into `DashboardPage` (HFA home) and `MyCasesPage` (Developer home)
- "✨ Catch me up" re-trigger button in each page's toolbar
- Role-aware content: HFA sees case/prerequisite summary; Developer sees their own task/milestone summary
- Session-scoped dismiss (in-memory only — refreshing restores the banner)

### Out of Scope (deferred to Bolt 015)
- Real Claude API call (replaced by pre-written dummy strings in Bolt 014)
- Live Supabase data in summary (hardcoded demo scenarios)
- Dynamic action chips from AI (chips are hardcoded in Bolt 014)

### Relationship to Other Units
- **Unit 003 (HFA Dashboard)**: banner mounts above the case list on `DashboardPage`
- **Unit 008 (Participant Case List)**: banner mounts above the case list on `MyCasesPage`
- **Unit 009 (My Tasks)**: "View My Tasks" chip navigates to `/my-tasks`
- **Unit 010 (Activity Feed)**: data from activity, tasks, and conversations feeds into the AI summary (real data in Bolt 015)

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-14 | AI Briefing Banner — role-aware catch-up summary on home screen | Must (hackathon) |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Briefing | A role-specific summary text + action chips for the current user |
| BriefingChip | A labelled action button with a navigation route |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `AiBriefingService.getBriefing(isHfa)` | Returns dummy `{ text, chips }` for the user's role |
| `AiBriefingService.startStream(text, target, onComplete)` | Typewriter effect — emits one character every 12ms into a `WritableSignal<string>` |
| `AiBriefingService.dismiss()` | Sets `visible` to false for the session |
| `AiBriefingService.resetAndShow()` | Restores `visible` to true and replays the stream |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 1 |
| Must Have | 1 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | AI briefing banner — role-aware streaming catch-up on home screen | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 003-hfa-dashboard | Mounts banner on `DashboardPage` |
| 008-participant-case-list | Mounts banner on `MyCasesPage` |
| 002-auth-screens | `AuthService.isHfa` used to select role-specific content |

### Depended By
| Unit | Reason |
|------|--------|
| (Bolt 015) | Real Claude API + Supabase Edge Function replaces dummy data |

---

## Technical Context

### Implementation
- `AiBriefingService` (`providedIn: 'root'`): `visible = signal(true)`, hardcoded dummy strings, `setInterval`-based typewriter
- `AiBriefingBannerComponent`: standalone, no inputs, reads role via `AuthService.isHfa()`, owns skeleton→stream→chips lifecycle, cleans up interval in `ngOnDestroy`
- Template guard: `@if (briefingService.visible()) { <app-ai-briefing-banner /> }` in each host page
- Styling: gradient card (`#f0f4ff → #e8f0fe`), left accent border, shimmer skeleton, blinking `|` cursor

---

## Constraints

- No real API call in Bolt 014 — dummy data only
- Dismiss is session-scoped (in-memory) — page refresh restores the banner
- No `IonModal`, `IonActionSheet`, `IonAlert`
- No RxJS — Angular Signals only

---

## Success Criteria

### Functional
- [ ] Banner appears at top of Dashboard (HFA) and My Cases (Developer) on every page load
- [ ] Skeleton shimmer shown for ~300ms before text begins streaming
- [ ] Text streams character-by-character (typewriter effect)
- [ ] Action chips appear after stream completes
- [ ] Dismiss (✕) hides banner for the session
- [ ] ✨ button in toolbar replays the banner

### Non-Functional
- [ ] Stream starts within 300ms of component mount
- [ ] No memory leaks — interval cleared on component destroy

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-020 | S1 | AI briefing banner — dummy data + typewriter streaming |
| bolt-021 | S1 (extension) | Connect to Claude API via Supabase Edge Function — real data |
