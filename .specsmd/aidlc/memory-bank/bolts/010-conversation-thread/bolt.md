---
id: '010'
unit: 007-conversation-thread
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: complete
started: '2026-06-25T16:00:00Z'
current_stage: null
stages_completed:
  - name: plan
    completed: '2026-06-25T16:00:00Z'
    artifact: implementation-plan.md
  - name: implement
    completed: '2026-06-25T17:00:00Z'
    artifact: implementation-walkthrough.md
stories:
  - 003-mention-autocomplete-and-notification
  - 004-notification-bell
created: '2026-06-24T00:00:00Z'
updated: '2026-06-25T16:00:00Z'
requires_bolts:
  - '009'
enables_bolts: []
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: Global notification bell across all pages; four trigger types (mention, tagged, assigned, overdue); notifications table + Realtime subscription; @-mention popup in composer
completed: '2026-06-25T15:59:19Z'
---

# Bolt 010 — Conversation Thread: @-Mention Popup + Global Notification Bell

## Objective

Add @-mention participant picker popup to the composer and build the global notification bell — a top-right header icon visible on every page that aggregates four notification types: @mentions, tagged-in-case, assigned-to-prerequisite, and client-side overdue milestones.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 003-mention-autocomplete-and-notification | '@' popup participant picker + @mention token insert + Edge Function email | Must |
| 004-notification-bell | Global bell (header, all pages), four trigger types, inline panel, Realtime badge | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- **Schema addition**: `notifications` table in Unit 001 schema — `id`, `user_id`, `type`, `title`, `body`, `case_id`, `prereq_id`, `read_at`, `created_at`; RLS: user sees only their own rows
- **@-mention popup**: typing `@` in composer opens positioned popup listing case participants; filter as user types; select inserts `@Name` token; on send, extract tokens and call Edge Function
- **Notification writes**: extend three existing Edge Functions / service calls to write to `notifications`:
  - `dispatch-mention-notification` → type `mention`
  - `create-case` (unit 004) → type `tagged` for each added participant
  - `triggerDocumentRequest` (unit 006) → type `assigned` for the assignee
- **Overdue**: `computed()` signal — cross-case milestones where `activated_at + target_days < now()` AND status != `completed`
- **Bell**: in global app shell header (top-right, next to profile icon); `totalBadge = unreadCount + overdueCount`; tap opens inline panel (absolute-positioned, no modal)
- **Mark read**: open panel → UPDATE all unread notifications → reset `unreadCount`

### Stage 2: Implement
- **`notifications` table**: add to `supabase/migrations/` — coordinate with Unit 001
- **@-mention popup** (from story 003):
  - Extend `ConversationComposerComponent`: detect `@` → emit `mentionQuery` signal
  - `MentionPopupComponent`: positioned `absolute` above composer; filters `CaseDetailStore.participants` signal
  - On select: insert `@{displayName}` at cursor; close popup
  - On send: extract @-mention tokens → call `supabase.functions.invoke('dispatch-mention-notification', ...)`
  - Edge Function also writes to `notifications` table
- **`NotificationService`** (new global service):
  - `notifications = signal<Notification[]>([])`
  - `unreadCount = computed(() => notifications().filter(n => !n.readAt).length)`
  - `overdueItems = signal<OverdueItem[]>([])` — populated from cross-case milestone query on service init
  - `totalBadge = computed(() => unreadCount() + overdueItems().length)`
  - `getNotifications(userId)`: Supabase query `notifications` WHERE `user_id = userId` ORDER BY `created_at DESC` LIMIT 20
  - `markAllRead()`: UPDATE `notifications` SET `read_at = now()` WHERE unread; reset local signal
  - Realtime: subscribe to `notifications` table for this user; on INSERT prepend and increment `unreadCount`
- **Bell component** in app shell template (`AppComponent` or `IonHeader` shared layout):
  - `IonButton` + `IonIcon` (bell) + `IonBadge` driven by `totalBadge()`
  - `panelOpen = signal(false)`; `(click)` toggle; `document:click` host listener to close on outside click
  - Inline panel: `@if (panelOpen())` block; `position: absolute; top: var(--header-height); right: 0; z-index: 1000`
  - `@for (n of notifications(); track n.id)` loop; type icon + title + body + relative timestamp
  - Overdue section at top of panel (if any overdue items)
  - Each row `(click)` → `Router.navigate(['/cases', n.caseId])`; close panel
  - On panel open → `NotificationService.markAllRead()`

### Stage 3: Test
- **@-mention**: type `@` in composer → popup appears; type a name → list filters; select → `@Name` inserted; send → Edge Function invoked; `notifications` row written for mentioned user; bell increments for mentioned user in second browser
- **Tagged**: HFA creates a case and adds Developer → Developer's bell increments in second browser
- **Assigned**: HFA triggers document request on a prereq → assignee's bell increments
- **Overdue**: seed a milestone with `target_days = 1` and `activated_at = 2 days ago` → bell badge shows overdue count; overdue item appears at top of notification panel
- **Panel behavior**: open panel → mark-read fires → badge resets to 0; click outside → panel closes; tap a notification row → navigates to correct case
- **Empty state**: user with no notifications and no overdue sees "You're all caught up"
- **Realtime**: notification written in second browser → bell badge increments in first browser live
