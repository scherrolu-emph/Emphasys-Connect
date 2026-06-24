---
unit: 007-conversation-thread
intent: 001-construction-milestone-workspace
phase: inception
status: draft
created: 2026-06-24T00:00:00Z
updated: 2026-06-24T00:00:00Z
unit_type: frontend
default_bolt_type: simple-construction-bolt
---

# Unit Brief: Conversation Thread

## Purpose

Renders the Conversation panel for both personas — a fully flat, chronological thread of system events and manual HFA↔Developer messages. Provides the message composer with @-mention autocomplete and manages the in-app notification bell (unread count). New messages arrive live via Supabase Realtime with no page refresh. This is the hero demo surface: the instant a prerequisite status changes, a system message appears in the thread for both participants simultaneously.

## Scope

### In Scope
- Conversation panel component (used in both HFA and Developer case detail views)
- Flat chronological message list: system messages + manual messages interleaved
- System message rendering: styled differently from manual messages (muted background, system icon, terse text)
- Manual message rendering: author display name + contact role + timestamp
- Message composer: text input + send button
- @-mention autocomplete: `@` in composer triggers participant autocomplete dropdown; selected mention inserts `@[name]` token
- @-mention dispatch: sending a message with @-mention triggers email notification to mentioned participant (Edge Function)
- Notification bell: badge in case header showing unread message count since last visit; clears on case open
- Realtime: new `conversation_messages` rows broadcast to this component → append to thread without refresh
- "Load more" / pagination for initial 50 messages
- Auto-scroll to bottom on new message

### Out of Scope
- Sub-threads or folded notes on specific prerequisites (fully flat — no nesting)
- Rich text / file attachments in messages
- Message editing or deletion
- Read receipts per message

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-9 | Manual Messaging — HFA and Developer can post messages; appear live via Realtime | Must |
| FR-11 | @-Mentions and Notification Bell — @-mention triggers email; bell shows unread count | Must |

---

## Domain Concepts

### Key Entities
| Entity | Description |
|--------|-------------|
| Conversation Message | `message_type: system \| manual`; `author_id` (null = system); `body`; `metadata` (JSON for system events) |
| @-Mention Token | `@[DisplayName]` in message body; resolved to `user_id` for notification dispatch |
| Unread Count | Count of messages in `conversation_messages` with `created_at > user's last_viewed_at` for this case |

### Key Operations
| Operation | Description |
|-----------|-------------|
| `MessageService.getMessages(caseId, limit, offset)` | Paginated message fetch |
| `MessageService.sendMessage(caseId, body)` | Inserts manual message row |
| `MessageService.parseMentions(body)` | Extracts `@[name]` tokens → user IDs |
| `NotificationService.dispatchMentionNotification(userId, caseId)` | Edge Function: sends email to mentioned user |
| `NotificationService.markCaseRead(caseId, userId)` | Updates `last_viewed_at`; clears unread count |
| Realtime handler | Appends new `conversation_messages` rows to thread signal |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 4 |
| Must Have | 4 |

### Stories
| Story ID | Title | Priority |
|----------|-------|----------|
| 001 | Thread rendering — system messages and manual messages in chronological order | Must |
| 002 | Message composer — text input, send, auto-scroll to bottom | Must |
| 003 | @-mention autocomplete, token insertion, mention notification dispatch | Must |
| 004 | Notification bell — unread count badge, clears on case open | Must |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 005-case-detail-shell | Panel slot, `CaseDetailStore` (participants for @-mention autocomplete), Realtime already subscribed |

### Depended By
None — terminal feature unit.

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Email Provider | @-mention notification delivery | Medium — Edge Function; stub for hackathon |
| Supabase Realtime | Live message append | Low — already wired in Unit 005 |

---

## Technical Context

### Suggested Technology
- Virtual scroll (`@angular/cdk/scrolling`) for long threads
- Angular Signal for `messages` array — `CaseDetailStore.messages`
- Realtime handler in Unit 005 pushes new messages into `CaseDetailStore.messages` signal
- @-mention: simple regex parse on `@` keypress; overlay dropdown of participants
- `MessageService` — all Supabase message writes
- `NotificationService` — Edge Function invocations
- `IonTextarea` or native `textarea` for composer (auto-grow)

### Integration Points
| Integration | Type | Notes |
|-------------|------|-------|
| Supabase PostgreSQL | Write | `conversation_messages` insert |
| Supabase Realtime | Read (via CaseDetailStore) | New message events pushed into messages signal |
| Edge Function `dispatch-mention-notification` | Invoke | Sends email to mentioned participant |

---

## Constraints

- Fully flat thread — no sub-threads, no folding onto prerequisites
- System messages are written by services (Unit 006), not by this unit — this unit only renders them
- @-mention autocomplete should only show current case participants

---

## Success Criteria

### Functional
- [ ] Thread renders system messages (styled differently) and manual messages in chronological order
- [ ] HFA can send a manual message; Developer sees it appear without page refresh (Realtime)
- [ ] Developer can send a message; HFA sees it appear without page refresh (hero demo requirement)
- [ ] `@` in composer opens participant dropdown; selecting a participant inserts `@[name]`
- [ ] Sending a message with @-mention dispatches email notification to mentioned participant
- [ ] Notification bell shows correct unread count; clears when case is opened
- [ ] "Load more" fetches older messages and prepends them

### Non-Functional
- [ ] New message (manual or system) appears in thread < 1 second after DB write (Realtime)

---

## Bolt Suggestions

| Bolt | Stories | Objective |
|------|---------|-----------|
| bolt-007-1 | S1, S2 | Thread rendering + composer (messages display and send) |
| bolt-007-2 | S3, S4 | @-mention autocomplete, notification dispatch, bell |
