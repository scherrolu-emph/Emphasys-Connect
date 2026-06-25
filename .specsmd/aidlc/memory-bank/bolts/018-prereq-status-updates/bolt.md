---
id: '018'
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
status: complete
type: simple-construction-bolt
stories:
  - 006-prerequisite-not-ready-state
  - 007-document-status-labels
created: '2026-06-25T12:00:00Z'
started: '2026-06-25T22:00:00Z'
completed: '2026-06-25T21:51:58Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-06-25T22:00:00Z'
    artifact: implementation-plan.md
  - name: implement
    completed: '2026-06-25T22:30:00Z'
    artifact: implementation-walkthrough.md
requires_bolts:
  - '015'
enables_bolts: []
requires_units: []
blocks: false
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt 018 — Prerequisite Status Updates

## Objective

Two prerequisite display improvements: "Not Ready" for prerequisites in non-active milestones, and accurate document status labels ("Submitted - Under Review", "Deficiency").

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 006-prerequisite-not-ready-state | "Not Ready" display for non-active milestone prereqs | Must |
| 007-document-status-labels | "Submitted - Under Review" + "Deficiency" status labels | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Map current prerequisite status rendering in HFA actions panel and participant status panel
- Determine how to distinguish "returned-pending" from "first-time-pending" — options: `return_count` column, `returned` boolean, or derive from conversation message history
- Design the display-status mapping function (pure function, no DB writes)
- Confirm Realtime event path that triggers re-evaluation when milestone status changes

### Stage 2: Implement
- Add `returned` boolean (or `return_count` int) to `prerequisites` table via migration; set to `false`/`0` on existing rows
- Update `002-accept-and-return-actions` mutation: set `returned = true` when HFA submits a return
- Create `getDisplayStatus(prereq, milestone)` helper:
  - `milestone.status !== 'active'` → `'Not Ready'`
  - `prereq.status === 'received_processing'` → `'Submitted - Under Review'`
  - `prereq.status === 'pending_open' && prereq.returned` → `'Deficiency'`
  - `prereq.status === 'pending_open'` → `'Pending'`
  - `prereq.status === 'accepted'` → `'Accepted'`
- Apply `getDisplayStatus` in HFA actions panel and participant status panel
- "Not Ready" prereqs: hide action buttons (HFA) and upload links (participant)

### Stage 3: Test
- Non-active milestone prereqs show "Not Ready"; action buttons hidden
- Submitted prereq shows "Submitted - Under Review" for both HFA and participant
- Returned prereq shows "Deficiency" after return action
- First-time pending prereq still shows "Pending"
- Milestone activates via Realtime → "Not Ready" prereqs update to their real status without refresh
