---
stage: plan
bolt: 010-conversation-thread
created: 2026-06-25T16:00:00Z
---

## Implementation Plan: Conversation Thread — @-Mention Popup + Notification Bell

### Objective

Extend the existing `ConversationComposerComponent` (bolt 009) with an @-mention participant picker popup and build a global notification bell that aggregates four notification types (mention, tagged, assigned, overdue) into a badged header icon visible on every page.

---

### Deliverables

1. **DB migration**: `notifications` table + RLS policy
2. **`NotificationService`**: root-scoped singleton — signals for `notifications`, `unreadCount`, `overdueItems`, `totalBadge`; Realtime subscription; `markAllRead()`
3. **`MentionPopupComponent`**: positioned dropdown above composer; filters participants by query; emits `selected`
4. **Extend `MessageComposerComponent`**: detect `@` keypress → emit `mentionQuery`; close popup on Escape/outside-click
5. **Extend `ConversationPanelComponent`**: on send, parse `@[Name]` tokens → resolve user IDs → call Edge Function
6. **Edge Function `dispatch-mention-notification`**: extend to INSERT `notification` row (type: `mention`) + log email (hackathon stub)
7. **Extend `CaseService.addParticipant`**: after participant insert, INSERT `notification` row (type: `tagged`) for the newly added user
8. **`NotificationBellComponent`**: `IonButton` + bell icon + `IonBadge`; inline panel with `@for` notification rows; click-outside close; mark-all-read on open
9. **Wire bell into app shell**: add `NotificationBellComponent` to `AppComponent` as a fixed overlay (avoids touching all page headers)
10. **Overdue computed in `NotificationService`**: cross-case milestone query on service init; `overdueItems = signal<OverdueItem[]>([])`

---

### Dependencies

| Dependency | Status | Notes |
|---|---|---|
| `MessageComposerComponent` | ✅ bolt 009 | Already exists at `components/conversation/message-composer/`; will be extended |
| `ConversationPanelComponent` | ✅ bolt 009 | Smart component that owns `sendMessage`; will parse mentions and call Edge Function |
| `CaseDetailStore.participants()` | ✅ bolt 006 | Signal already populated; used as @-mention participant source |
| `CaseService.addParticipant` | ✅ bolt 006 | Will be extended to write `tagged` notification |
| `PrerequisiteService.triggerDocumentRequest` | ⏳ bolt 008 (parallel) | Bolt 008 will call `NotificationService.writeNotification('assigned', ...)` — we expose the method; bolt 008 wires the call |
| Supabase Edge Functions runtime | ✅ bolt 001 | `dispatch-mention-notification` is a new Edge Function (created here) |

---

### Technical Approach

#### @-Mention Popup

- **Detection**: in `MessageComposerComponent`, listen to `(input)` events on the native textarea. When the cursor is immediately after `@` (regex: `/@(\w*)$/` on the text before cursor), emit `mentionQuery = signal<string | null>()` — non-null string triggers popup, `null` closes it.
- **Filtering**: `MentionPopupComponent` accepts `participants = input<CaseParticipant[]>()` and `query = input<string>()`. Computes a `filtered = computed(() => ...)` from these two inputs. Case-insensitive prefix match on `displayName`.
- **Insertion**: on select, the panel emits `participantSelected = output<CaseParticipant>()`. `ConversationPanelComponent` receives this and calls a method on the composer to replace the `@query` segment at the cursor with `@[DisplayName]` using `textarea.setRangeText(...)`.
- **Popup positioning**: `position: absolute; bottom: 100%; left: 0` relative to the `ConversationPanelComponent` container (the composer sits at the bottom of the panel). Max height + scroll for long lists.
- **Close on Escape/outside**: host listener `@HostListener('document:keydown.escape')` and `@HostListener('document:click', ['$event'])` in `MentionPopupComponent` — emit `dismissed` output if click target is outside the popup.

#### Mention Dispatch

- `ConversationPanelComponent.sendMessage()` (already calls `MessageService.sendMessage()`): after DB insert succeeds, parse body for `@[Name]` tokens using `/\@\[([^\]]+)\]/g`. Map display names to `user_id` from `store.participants()`. Call `supabase.functions.invoke('dispatch-mention-notification', { body: { caseId, mentionedUserIds, messagePreview: body.slice(0, 100) } })`. Fire-and-forget (no blocking send UX on Edge Function response).
- **Edge Function** (`supabase/functions/dispatch-mention-notification/index.ts`): for each `mentionedUserId`, INSERT into `notifications` (`type: 'mention'`, `user_id`, `case_id`, `title`, `body`). Log email delivery (no real email for hackathon).

#### Tagged Notification

- In `CaseService.addParticipant()`, after the `case_participants` INSERT, INSERT a `notifications` row: `type: 'tagged'`, `user_id = newParticipantUserId`, `case_id`, title = "You were added to [case title]".
- Done inline (no Edge Function needed) — same service method handles both writes sequentially.

#### Assigned Notification Interface

- `NotificationService` exposes `writeNotification(type, userId, caseId, title, body, prereqId?)` — a thin wrapper over a Supabase insert.
- Bolt 008's `PrerequisiteService.triggerDocumentRequest()` will call this method. We expose it now; bolt 008 calls it.

#### `NotificationService`

- `providedIn: 'root'`
- On init: call `loadNotifications(userId)` (Supabase query, LIMIT 20, ORDER BY `created_at DESC`); subscribe to Realtime on `notifications` table filtered by `user_id = currentUserId`; call `loadOverdueItems(userId)` (query milestones across user's cases where `activated_at + target_days * interval '1 day' < now()` AND `status != 'completed'`).
- Signals: `notifications = signal<Notification[]>([])`, `unreadCount = computed(() => notifications().filter(n => !n.readAt).length)`, `overdueItems = signal<OverdueItem[]>([])`, `overdueCount = computed(() => overdueItems().length)`, `totalBadge = computed(() => unreadCount() + overdueCount())`.
- `markAllRead()`: UPDATE `notifications` SET `read_at = now()` where unread for this user → update local signal.
- On auth sign-out: clear all signals + remove Realtime subscription.

#### `NotificationBellComponent`

- Standalone; imports `IonButton`, `IonIcon`, `IonBadge`.
- `@HostListener('document:click', ['$event'])` closes panel on outside-click.
- Inline panel: `@if (panelOpen())` block, `position: absolute; top: var(--ion-toolbar-height, 56px); right: 0; z-index: 1000; width: 360px; max-width: 100vw`. Max height + scroll.
- Panel sections: overdue items first (warning icon), then notification rows (newest-first). Empty state when both zero.
- On panel open: `notificationService.markAllRead()`.

#### Bell in App Shell

- **Approach**: Add `NotificationBellComponent` to `AppComponent`'s template as a `position: fixed; top: 0; right: 0` overlay — this makes it appear above all route pages without touching any page `IonHeader`. `z-index: 1001` (above Ionic header).
- **Caveat**: only render when `authService.currentUser()` is non-null (hide on login screens).
- This avoids refactoring any existing page headers for the hackathon.

---

### Acceptance Criteria

- [ ] Typing `@` in composer opens participant picker popup
- [ ] Continuing to type filters the participant list in real time
- [ ] Selecting a participant inserts `@[DisplayName]` at cursor; popup closes
- [ ] Escape / click outside closes popup without inserting
- [ ] Sending a message with `@[Name]` calls `dispatch-mention-notification` Edge Function; `notifications` row written; bell increments for mentioned user
- [ ] Adding a participant as HFA writes a `tagged` notification for the added user
- [ ] `NotificationService.writeNotification('assigned', ...)` method exists and is callable by bolt 008
- [ ] Bell icon visible on all authenticated pages with correct badge count
- [ ] Tapping bell opens inline panel; notifications listed newest-first with type icon + title + relative timestamp
- [ ] Overdue milestones shown at top of panel (warning icon, days overdue)
- [ ] Tapping a notification navigates to `/cases/{caseId}`; panel closes
- [ ] Panel open → all unread notifications marked read; badge resets to 0
- [ ] Click outside panel / Escape → panel closes
- [ ] Empty state: "You're all caught up" when no unread + no overdue
- [ ] New notification arrives via Realtime → badge increments without refresh

---

### Schema Change

New migration `supabase/migrations/0003_notifications.sql`:

```sql
CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) NOT NULL,
  type       text NOT NULL,
  title      text NOT NULL,
  body       text,
  case_id    uuid REFERENCES cases(id),
  prereq_id  uuid REFERENCES prerequisites(id),
  read_at    timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);  -- restricted to service role via supabase client config
```

---

### Files to Create / Modify

**New files:**
- `supabase/migrations/0003_notifications.sql`
- `supabase/functions/dispatch-mention-notification/index.ts`
- `client/src/app/components/conversation/mention-popup/mention-popup.component.ts`
- `client/src/app/components/conversation/mention-popup/mention-popup.component.html`
- `client/src/app/components/conversation/mention-popup/mention-popup.component.scss`
- `client/src/app/components/notification-bell/notification-bell.component.ts`
- `client/src/app/components/notification-bell/notification-bell.component.html`
- `client/src/app/components/notification-bell/notification-bell.component.scss`
- `client/src/app/core/notification/notification.service.ts`
- `client/src/app/models/notification.model.ts`

**Modified files:**
- `client/src/app/components/conversation/message-composer/message-composer.component.ts` — add `@`-detect + `mentionQuery` signal
- `client/src/app/components/conversation/message-composer/message-composer.component.html` — emit query on input
- `client/src/app/components/conversation/conversation-panel/conversation-panel.component.ts` — wire popup, parse mentions on send, call Edge Function
- `client/src/app/components/conversation/conversation-panel/conversation-panel.component.html` — include `<app-mention-popup>`
- `client/src/app/core/case/case.service.ts` — extend `addParticipant` to write `tagged` notification
- `client/src/app/app.component.ts` — import `NotificationBellComponent`
- `client/src/app/app.component.html` — add bell overlay
- `client/src/app/lib/database.types.ts` — regenerate after migration (manual step)
