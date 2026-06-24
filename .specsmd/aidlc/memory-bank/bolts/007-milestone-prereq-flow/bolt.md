---
id: "007"
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 001-hfa-actions-panel
  - 004-developer-status-panel
created: 2026-06-24T00:00:00Z
requires_bolts: ["006"]
enables_bolts: ["008"]
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: HFA checklist rendering with status badges + Developer read-only status panel; both driven from CaseDetailStore signals
---

# Bolt 007 — Milestone/Prereq Flow: Display Panels

## Objective

Render the read-only display panels: HFA Actions panel (milestone/prerequisite checklist with status badges) and Developer Status panel (read-only progress view with upload links placeholder). Both consume `CaseDetailStore` signals — no mutations yet.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-hfa-actions-panel | Actions panel with prereq checklist + status badges | Must |
| 004-developer-status-panel | Developer read-only status + upload links | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- HFA Actions panel: grouped by milestone; each milestone shows status badge + list of prerequisites
- Prerequisite row: name, type icon, status badge (`pending_open` / `received_processing` / `accepted`)
- Status badge colors from ux-guide.md: pending = neutral, received = caution amber, accepted = success green
- Developer Status panel: same milestone/prereq tree but read-only; upload link shown per `document_submission` prereq when triggered
- Both components are presentational: receive data via `input()` signals from parent store

### Stage 2: Implement
- `HfaActionsPanelComponent`: standalone, accepts `milestones = input<MilestoneWithPrereqs[]>()`
- Renders `@for` milestones with `@for` prerequisites nested
- Status badge component: `PrereqStatusBadge` presentational with `status = input()`
- Milestone status badge: `open` (grey ring), `active` (blue), `completed` (green checkmark)
- Prereq action buttons (disabled/placeholder in this bolt — bolt 008 adds click handlers)
- `DeveloperStatusPanelComponent`: standalone, same data structure, all actions stripped
- Upload link row: shown when `prerequisite.upload_url` is present (null until triggered by HFA in bolt 008)
- Wire both panels into `CaseDetailComponent` slots from bolt 006

### Stage 3: Test
- Case detail loads → HFA Actions panel shows Milestone 1 (active) with 2 prereqs
- Milestone 2 shows as `open` (greyed out)
- Prereq with `received_processing` shows amber badge
- Prereq with `pending_open` shows neutral badge
- Developer panel shows same structure, no action buttons
- Live update: change prereq status in Supabase Studio → badge updates within 2s (via Realtime signal)
