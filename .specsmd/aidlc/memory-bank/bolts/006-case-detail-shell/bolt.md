---
id: "006"
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 001-two-panel-layout
  - 002-hfa-panel-slots
  - 003-developer-panel-slots
  - 004-data-loading-and-realtime
created: 2026-06-24T00:00:00Z
requires_bolts: ["002", "005"]
enables_bolts: ["007", "009"]
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: Responsive two-panel CSS grid, per-role panel slot rendering, CaseDetailStore with Realtime lifecycle
---

# Bolt 006 — Case Detail Shell: Two-Panel Layout + CaseDetailStore

## Objective

Build the case detail page shell: responsive two-panel layout (Actions + Conversation on desktop; toggle tabs on mobile), role-based panel slot rendering, and `CaseDetailStore` with full Realtime subscription lifecycle.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-two-panel-layout | Desktop grid + mobile single-column with toggle | Must |
| 002-hfa-panel-slots | HFA Actions + Conversation panel containers | Must |
| 003-developer-panel-slots | Developer Status + Conversation, access guard | Must |
| 004-data-loading-and-realtime | CaseDetailStore, queries, Realtime lifecycle | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Layout: CSS grid `grid-template-columns: 1fr 1fr` on ≥768px; single column on mobile
- Mobile toggle: segment control "Actions | Conversation" (HFA) or "Status | Conversation" (Developer)
- `CaseDetailStore`: signals for `case`, `milestones`, `prerequisites`, `messages`, `loading`
- Realtime: subscribe in `ionViewDidEnter`, unsubscribe in `ionViewWillLeave`
- Role guard for Developer panel: if `is_hfa`, show HFA panels; else show Developer panels
- Panel slots are containers — content components rendered by bolt 007 and bolt 009

### Stage 2: Implement
- Create `CaseDetailComponent` at `/cases/:id` wrapping `IonPage`, `IonHeader`, `IonContent`
- Two-panel CSS: `.panel-grid` with `@media` breakpoints; mobile uses segment to toggle visibility
- `CaseDetailStore` as Signal-based service: `case = signal<Case | null>(null)`, `milestones`, `prerequisites`, `messages`
- On init: query case + milestones + prerequisites + messages from Supabase
- `ionViewDidEnter`: call `RealtimeService.subscribeToCase(caseId)` with callbacks updating signals
- `ionViewWillLeave`: call `unsubscribe(handle)`
- `HfaActionsPanel` slot: empty container (bolt 007 fills it)
- `DeveloperStatusPanel` slot: empty container (bolt 007 fills it)
- `ConversationPanel` slot: empty container (bolt 009 fills it)
- Developer access guard: `is_hfa` false + participant check → show Developer panels; else HFA panels

### Stage 3: Test
- Navigate to `/cases/:id` → page loads, case title in header
- Desktop ≥768px: two panels visible side by side
- Mobile: single panel; segment switches between panels
- HFA user: sees Actions panel slot + Conversation slot
- Developer user: sees Status panel slot + Conversation slot
- Developer not in `case_participants` → denied (redirect or error state)
- Realtime: modify a row in Supabase Studio → store signal updates within 2s
- `ionViewWillLeave` → RealtimeService channel closed (verify in Studio)
