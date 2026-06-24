---
id: 004-notification-bell
unit: 007-conversation-thread
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
updated: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 004-notification-bell

## User Story
**As any** authenticated user
**I want** to see a notification bell in the top-right header next to my profile icon, visible on every page
**So that** I am always aware of mentions, assignments, case additions, and overdue items without having to navigate into each case

## Notification Trigger Types

| Type | Trigger | Written by |
|------|---------|------------|
| `mention` | Another user sends a message containing `@[MyName]` | `dispatch-mention-notification` Edge Function (story 003 already calls this; extend to write to `notifications` table) |
| `tagged` | This user is added as a case participant | `create-case` Edge Function (unit 004) or `add-participant` mutation; writes notification row on `case_participants` INSERT |
| `assigned` | A prerequisite's `assigned_to` is set to this user | `triggerDocumentRequest` service call (unit 006, story 003) writes notification row |
| `overdue` | A milestone's `activated_at + target_days < now()` AND `status != 'completed'` | Client-side computed signal — NOT stored in `notifications` table |

## Acceptance Criteria

### Bell placement and visibility
- [ ] **Given** any authenticated page (Cases, My Tasks, Activity, Case Detail), **When** the page renders, **Then** a bell icon is shown in the global top-right header, next to the user profile icon
- [ ] **Given** the user has at least one unread notification or at least one overdue item, **When** the header renders, **Then** a numeric badge is shown on the bell icon; **Given** the count is 0, **Then** the badge is hidden

### Notification panel
- [ ] **Given** the user taps the bell icon, **When** the tap fires, **Then** an inline notification panel opens directly below the bell (positioned `absolute` to the header, not a modal or route change)
- [ ] **Given** the panel is open, **When** it renders, **Then** notifications are listed newest-first; each row shows: notification type icon, title (e.g. "You were mentioned in Riverside Commons"), body preview, relative timestamp
- [ ] **Given** an overdue item, **When** it appears in the panel, **Then** it shows a warning icon, the milestone name, the case name, and how many days overdue
- [ ] **Given** a notification row is tapped, **When** the tap fires, **Then** the panel closes and the app navigates to `/cases/{caseId}` for that notification
- [ ] **Given** the user taps outside the panel or presses Escape, **When** the event fires, **Then** the panel closes without navigating
- [ ] **Given** the panel opens, **When** it renders, **Then** all `mention`, `tagged`, and `assigned` notifications in the panel are marked as read (`read_at` set to now); the badge count updates immediately

### Live updates
- [ ] **Given** a new notification is written for this user (via Realtime on the `notifications` table), **When** the broadcast arrives, **Then** the bell badge count increments without a page refresh
- [ ] **Given** the overdue signal is computed on app load, **When** any of the user's active milestones are past their `target_days`, **Then** the overdue count is included in the badge total

### Empty state
- [ ] **Given** the panel opens with no unread notifications and no overdue items, **When** it renders, **Then** "You're all caught up" is shown

## Technical Notes

### `notifications` table (schema addition for Unit 001)
```sql
notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) not null,
  type        text not null,  -- 'mention' | 'tagged' | 'assigned'
  title       text not null,
  body        text,
  case_id     uuid references cases(id),
  prereq_id   uuid references prerequisites(id),
  read_at     timestamptz,    -- null = unread
  created_at  timestamptz default now()
)
```
RLS: users can only SELECT their own rows (`user_id = auth.uid()`).

### Badge count
- `unreadCount = signal<number>(0)` — count of `notifications` WHERE `read_at IS NULL` for this user
- `overdueCount = computed(() => ...)` — derived from milestones loaded in `CaseDetailStore` (or a separate cross-case milestone query in `NotificationService`)
- `totalBadge = computed(() => unreadCount() + overdueCount())`

### Notification panel
- `notificationPanelOpen = signal(false)` on a global `NotificationService`
- Panel rendered in the app shell component (not inside any route component); positioned with CSS `position: absolute; top: header-height; right: 0`
- Do NOT use `IonModal`, `IonActionSheet`, or `IonAlert`
- Click-outside: host listener on `document:click` with `$event.target` check

### Writing notifications
- `dispatch-mention-notification` Edge Function: extend to INSERT into `notifications` (type: `mention`) for each mentioned user
- `create-case` Edge Function: INSERT `notifications` (type: `tagged`) for each non-creating participant added
- `triggerDocumentRequest` in `PrerequisiteService`: after setting `assigned_to`, INSERT a `notifications` row (type: `assigned`) for the assignee
- Overdue: NOT written to `notifications`; computed client-side from milestone signal

### Realtime
- Subscribe to `postgres_changes` on `notifications` table filtered by `user_id = currentUserId`; on INSERT increment `unreadCount`

### Marking as read
- On panel open: call `NotificationService.markAllRead()` — UPDATE `notifications` SET `read_at = now()` WHERE `user_id = currentUserId` AND `read_at IS NULL`; reset `unreadCount` to 0 locally

## Dependencies
### Requires
- `001-thread-rendering` (message model for mention context)
- `007/003-mention-autocomplete-and-notification` (dispatch-mention-notification Edge Function must also write to `notifications` table)
### Enables
- None

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User is mentioned multiple times in one message | One notification written per unique mention token in that message |
| User is tagged in a case they already participate in | No duplicate notification written (Edge Function checks existing `case_participants` before insert) |
| `target_days` is null on a milestone | Overdue count excludes that milestone |
| Notification panel is open and a new notification arrives via Realtime | New row prepends to the panel live; badge count stays 0 (panel is open = already seen) |
| User has 50+ notifications | Panel shows latest 20; "See all" links to Activity tab |

## Out of Scope
- Per-notification dismiss / delete
- Notification preferences (opt-in/out per type)
- Push notifications to device (post-hackathon)
- Email digest (story 003 handles individual @mention emails)
