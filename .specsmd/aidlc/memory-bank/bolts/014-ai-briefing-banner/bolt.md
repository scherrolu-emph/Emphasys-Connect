---
id: '014'
unit: 011-ai-briefing-banner
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: complete
started: '2026-06-25T00:00:00Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-06-25T00:00:00Z'
    artifact: implementation-plan.md
  - name: implement
    completed: '2026-06-25T00:00:00Z'
    artifact: implementation-walkthrough.md
  - name: test
    completed: '2026-06-25T00:00:00Z'
    artifact: test-walkthrough.md
stories:
  - 001-ai-briefing-banner-stream
created: '2026-06-25T00:00:00Z'
requires_bolts:
  - '013'
enables_bolts:
  - '015'
requires_units:
  - 003-hfa-dashboard
  - 008-participant-case-list
blocks: false
complexity:
  estimate: medium
  reason: New service + component + two page integrations; no schema changes; dummy data only
completed: '2026-06-25T00:00:00Z'
branch: feature/ai-briefing-banner
commits: 08e6a2c..e827bb3
---

# Bolt 014 — AI Briefing Banner (Dummy Data)

## Objective

Add a role-aware AI briefing banner to both home screens (Dashboard for HFA, My Cases for Developer). The banner streams a pre-written catch-up summary on every page load using a typewriter effect, surfaces action chips, and can be dismissed for the session or replayed via a toolbar button.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-ai-briefing-banner-stream | AI briefing banner — role-aware streaming catch-up on home screen | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Design spec: `docs/superpowers/specs/2026-06-25-ai-briefing-banner-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-25-ai-briefing-banner.md`
- Key decisions: no API call (dummy strings), show on every page load (no time gate), typewriter at 12ms/char, chips hardcoded per role

### Stage 2: Implement
- `AiBriefingService` — `visible = signal(true)`, `getBriefing(isHfa)`, `startStream()`, `dismiss()`, `resetAndShow()`
- `AiBriefingBannerComponent` — skeleton → stream → chips lifecycle, `ngOnDestroy` cleanup
- `DashboardPage` — banner inserted above filter chips; ✨ toolbar button
- `MyCasesPage` — banner inserted above case list; ✨ toolbar button
- `MyCasesPage` spec updated — `isHfa` signal mock + `AiBriefingService` mock added

### Stage 3: Test
- 349/350 tests passing (1 pre-existing `CaseDetailPage` realtime failure unrelated)
- 15 new tests: 8 `AiBriefingService` + 7 `AiBriefingBannerComponent`
- Final whole-branch review: READY TO MERGE
