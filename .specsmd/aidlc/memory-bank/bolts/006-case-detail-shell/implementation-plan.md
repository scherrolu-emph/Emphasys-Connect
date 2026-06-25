---
stage: plan
bolt: "006"
created: 2026-06-25T09:00:00Z
---

## Implementation Plan: Case Detail Shell

### Objective

Build the `/cases/:id` page end-to-end: responsive three-tab layout (mobile) / two-panel (tablet/desktop), `CaseDetailStore` with signal state + Realtime lifecycle, and a fully-functional Participants tab with grouped list, avatar initials, add/remove mutations (HFA only), and Conversation tab unread badge.

---

### Deliverables

1 - **Route + page skeleton** — `/cases/:id` lazy-loaded, `authGuard` protected, added to `app.routes.ts`

2 - **Domain models** — `CaseDetail`, `CaseParticipant`, `PrerequisiteSummary` interfaces added to `case.models.ts`; `Milestone` enriched with prerequisites; `referenceNumber` field on `CaseDetail`

3 - **`CaseDetailStore`** — standalone injectable `@Injectable({ providedIn: 'root' })` signal store with signals: `caseDetail`, `milestones`, `prerequisites`, `messages`, `participants`, `loading`, `error`; plus `loadCase(id)` and `reset()` methods

4 - **`CaseService` additions** — `getCaseDetail(id)`, `getParticipants(id)`, `addParticipant(caseId, email, role)`, `removeParticipant(caseId, participantId)` — each mutation also inserts a system `conversation_message`

5 - **`CaseDetailComponent`** (`pages/case-detail/`) — `IonPage` shell:
   - `IonHeader` with title, `referenceNumber` subtitle, `caseType` badge chip, active milestone name
   - Mobile `IonSegment` (3 buttons: Actions | Conversation | Participants) — `activeTab` signal drives `@if` visibility
   - Tablet/desktop CSS-grid two-panel; left = Actions slot; right panel has `IonSegment` sub-tabs (Conversation | Participants) driven by `activeRightTab` signal
   - `ionViewDidEnter` / `ionViewWillLeave` lifecycle hooks for Realtime subscribe/unsubscribe

6 - **`ParticipantsTabComponent`** (`components/participants-tab/`) — standalone, receives `participants` and `isHfa` as `input()` signals:
   - Three `computed()` groups: `agencyParticipants` (same `hfa_id`), `developerParticipants`, `otherParticipants`
   - `@for` per group with section header + count; section hidden if empty
   - `AvatarComponent` (standalone) — initials from display name, deterministic color from `nameHash % 8` palette
   - Row: avatar | name + YOU badge (if self) | role | lock icon (self) / trash icon (HFA, others)
   - HFA trash tap → `removingId` signal → inline confirm row → `removeParticipant()` call
   - HFA sticky "Add participant" button → `addFormOpen` signal → inline form (email + role select) → `addParticipant()` call
   - Pending invites (no profile): show email + "Pending" chip instead of name

7 - **Conversation tab unread badge** — `lastReadAt = signal<string>(now)` on `CaseDetailComponent`; `unreadCount = computed(...)` from messages; badge on Conversation `IonSegmentButton`; cleared when Conversation tab activated

8 - **Realtime wiring** — `RealtimeService.subscribeToCase(caseId)` broadcasts `case_participants` INSERT/DELETE events and `conversation_messages` INSERT events; `CaseDetailStore` handles callbacks to update `participants` and `messages` signals

9 - **Access guard** — if authenticated user is not in `case_participants`, redirect to `/my-cases` with toast; RLS also blocks the DB query as a second layer

10 - **`cases.reference_number` DB column** — migration to add `reference_number TEXT` to `cases` table (seed data already has values from bolt 005); update `database.types.ts` generated types

---

### Dependencies

- `001-workspace-foundation` — Supabase typed client, `RealtimeService`, DB schema; `cases.reference_number` column added here if not already present
- `002-auth-screens` — `AuthService` (authenticated session, `isHfa()`, `currentUserId()`)
- `005-case-import` (bolt 005) — seed cases with `reference_number`, `case_participants` rows exist

---

### Technical Approach

**Layout strategy**: Single `CaseDetailComponent` handles both mobile and tablet/desktop layouts via CSS media queries and two separate signal-driven segment controls. No separate mobile/desktop components — `@if` blocks + CSS `display: none` at appropriate breakpoints keep the component count low.

**Store design**: `CaseDetailStore` is a standalone `@Injectable` service (not `providedIn: 'root'` — provided in the component so each route navigation gets a fresh instance). `loadCase()` fires parallel queries for case detail, participants, and initial messages. Realtime callbacks are passed in from the component via the store's `onParticipantChange()` and `onMessageAdded()` methods.

**Avatar color palette**: 8-color deterministic hash — `charCodeAt` sum of display name, modulo 8; palette defined as CSS custom properties. Same color for same name across sessions.

**Add/remove participant mutations**: Implemented as RPC calls or direct inserts/deletes with a subsequent `conversation_messages` insert in the same Supabase client chain (not a transaction — acceptable for hackathon). System messages use `message_type: 'system'`.

**Unread badge**: `lastReadAt` is initialized to `new Date().toISOString()` on component init (not persisted). Switches to Conversation tab set `lastReadAt` to `now`. Computed `unreadCount` filters messages where `created_at > lastReadAt`. This is session-only — acceptable for hackathon.

---

### File Structure

```
client/src/app/
  core/
    cases/
      case.models.ts         ← add CaseDetail, CaseParticipant, PrerequisiteSummary
      case.service.ts        ← add getCaseDetail, getParticipants, addParticipant, removeParticipant
    realtime/
      realtime.service.ts    ← extend subscribeToCase to emit case_participants events
  pages/
    case-detail/
      case-detail.page.ts
      case-detail.page.html
      case-detail.page.scss
      case-detail.store.ts   ← CaseDetailStore (standalone service, provided in component)
  components/
    participants-tab/
      participants-tab.component.ts
      participants-tab.component.html
      participants-tab.component.scss
    avatar/
      avatar.component.ts
      avatar.component.html
      avatar.component.scss

supabase/migrations/
  YYYYMMDD_add_reference_number.sql   ← if not already added in bolt 005
```

---

### Acceptance Criteria

- [ ] `/cases/:id` route loads for authenticated participants; non-participants are redirected
- [ ] Case header displays title, reference number, case type badge, active milestone name
- [ ] Mobile: three-tab `IonSegment` (Actions | Conversation | Participants) shows one panel at a time
- [ ] Tablet/desktop (≥768px): two-panel CSS grid; right panel has sub-tabs (Conversation | Participants)
- [ ] `CaseDetailStore` signals populated on load; `loading` true during fetch, false after
- [ ] Realtime subscription opened on `ionViewDidEnter`; unsubscribed on `ionViewWillLeave`
- [ ] Participants tab shows three groups (YOUR AGENCY / DEVELOPER / OTHER PARTICIPANTS); empty sections hidden
- [ ] Avatar initials correct; color deterministic from name hash
- [ ] YOU badge on current user row; lock icon; no trash on self
- [ ] HFA: trash → inline confirm → participant removed; system message written
- [ ] HFA: "+ Add participant" → inline form → submit → participant row appears; system message written
- [ ] Cannot remove the only Developer — blocked with error message
- [ ] Pending invite rows show email + "Pending" chip
- [ ] Conversation tab badge shows unread count; clears when Conversation tab activated
- [ ] Realtime: new `case_participants` row inserted in Supabase Studio appears live in Participants tab
