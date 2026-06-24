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
  - 005-participants-tab
created: 2026-06-24T00:00:00Z
updated: 2026-06-24T00:00:00Z
requires_bolts: ["002", "005"]
enables_bolts: ["007", "009"]
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: Three-tab layout (Actions/Conversation/Participants), right-panel sub-tabs on tablet/desktop, CaseDetailStore, Participants tab with grouped list + add/remove mutations
---

# Bolt 006 — Case Detail Shell: Layout + CaseDetailStore + Participants Tab

## Objective

Build the case detail page shell: three-tab responsive layout (Actions | Conversation | Participants on mobile; two-panel with Conversation/Participants sub-tabs on tablet/desktop), role-based panel rendering, `CaseDetailStore` with Realtime lifecycle, and the Participants tab with grouped participant list, add/remove for HFA, and Conversation tab unread badge.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-two-panel-layout | Three-tab mobile toggle + right-panel sub-tabs on tablet/desktop | Must |
| 002-hfa-panel-slots | HFA panel containers + case header with reference number | Must |
| 003-developer-panel-slots | Participant Status + access guard | Must |
| 004-data-loading-and-realtime | CaseDetailStore, queries, Realtime lifecycle | Must |
| 005-participants-tab | Grouped participant list, add/remove (HFA), Conversation tab unread badge | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- **Layout (mobile)**: three-tab `IonSegment`: Actions/Status | Conversation | Participants; single visible panel at a time
- **Layout (tablet/desktop)**: CSS grid `2fr 3fr` / `1fr 2fr`; left panel = Actions/Status; right panel = sub-tab `IonSegment`: Conversation | Participants
- **`CaseDetailStore`**: signals for `case`, `milestones`, `prerequisites`, `messages`, `participants`, `loading`
- **Case header**: title + `referenceNumber` (e.g. "Lotus #MF-2024-0188") + `caseType` badge + active milestone — `cases.reference_number` column required in Unit 001 schema
- **Participants tab grouping**: YOUR AGENCY (HFA same org) | DEVELOPER | OTHER PARTICIPANTS
- **Avatar colors**: deterministic from name — hash to palette of 8 colors; no randomness
- **Add/remove**: `CaseService.addParticipant` / `removeParticipant`; each writes system message; HFA only
- **Conversation tab badge**: `unreadCount` computed from messages newer than `lastReadAt`; clears on tab activate

### Stage 2: Implement
- `CaseDetailComponent` at `/cases/:id`: `IonPage`, `IonHeader` (title + referenceNumber subtitle + caseType badge), `IonContent`
- Mobile `IonSegment` (3 buttons): `activeTab = signal<'actions'|'conversation'|'participants'>('actions')`; `@if` blocks show/hide each section
- Right-panel sub-tabs (tablet/desktop): `activeRightTab = signal<'conversation'|'participants'>('conversation')`; `@if` inside right panel container
- `CaseDetailStore`: add `participants = signal<CaseParticipant[]>([])` — query `case_participants JOIN profiles` on init
- Realtime: subscribe in `ionViewDidEnter`, unsubscribe in `ionViewWillLeave`; callbacks update all signals including `participants`
- **`ParticipantsTabComponent`** (standalone):
  - Three computed groups: `agencyParticipants`, `developerParticipants`, `otherParticipants`
  - `@for` loop per group with section header showing count; hide section if empty
  - Avatar component: initials + deterministic color from name hash
  - Row: name + YOU badge + role + email + lock/trash icon
  - HFA: trash tap → `removingId = signal(id)`; inline confirm row; confirm → `removeParticipant()`
  - HFA: sticky "Add participant" button at bottom; `addFormOpen = signal(false)`; inline form above CTA; submit → `addParticipant()`
  - Non-HFA: same list, no trash, no add button
- **Conversation tab badge**: `unreadCount = computed(() => messages().filter(m => m.createdAt > lastReadAt()).length)`; shown as badge on Conversation `IonSegmentButton`; clears when Conversation tab activated

### Stage 3: Test
- **Layout — mobile**: three tabs visible; tap each → correct content shown; Actions, Conversation, Participants each render independently
- **Layout — tablet**: two panels; right panel sub-tabs switch between Conversation and Participants content
- **Case header**: shows title + reference number + case type badge + active milestone
- **Participants tab — HFA**: grouped list (YOUR AGENCY / DEVELOPER / OTHER PARTICIPANTS); sections with 0 members hidden; YOU badge on self; lock on self row; trash on all others
- **Add participant**: tap "+ Add participant" → inline form → enter email + role → "Send invite" → new row appears in correct section with "Pending" label; system message in thread
- **Remove participant**: tap trash → inline confirm → confirm → row removed; system message in thread
- **Remove only developer**: blocked with error message
- **Participants tab — Participant**: same list, read-only; no trash icons; no add button
- **Pending invite**: participant with no profile shows email + "Pending" label
- **Conversation tab badge**: seed unread messages; badge shows correct count; switch to Conversation tab → badge clears
- **Realtime**: add participant in Supabase Studio → Participants tab updates live
