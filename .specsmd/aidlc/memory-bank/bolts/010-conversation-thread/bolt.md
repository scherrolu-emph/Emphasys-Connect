---
id: "010"
unit: 007-conversation-thread
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 003-mention-autocomplete-and-notification
  - 004-notification-bell
created: 2026-06-24T00:00:00Z
requires_bolts: ["009"]
enables_bolts: []
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: @-mention dropdown with participant autocomplete, Edge Function email dispatch, unread bell with count cleared on case open
---

# Bolt 010 — Conversation Thread: @-Mention + Notification Bell

## Objective

Add @-mention autocomplete to the composer (triggering an Edge Function email notification) and a notification bell in the case detail header showing unread message count since last visit.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 003-mention-autocomplete-and-notification | @-mention dropdown + email dispatch | Must |
| 004-notification-bell | Unread count badge, clear on case open | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- @-mention trigger: composer detects `@` typed → open autocomplete dropdown of `case_participants`
- Autocomplete: filter participants by display name prefix; select inserts `@name` into composer text
- On send with @-mention: after insert, call Edge Function `notify-mention` with mentioned user IDs
- Edge Function: calls Supabase `sendEmail` (or Resend/SMTP) with message preview to mentioned user
- Notification bell: query `conversation_messages` where `created_at > last_visit_at` for this case
- `last_visit_at` stored in `localStorage` (guard with `isPlatformBrowser()`); updated on `ionViewDidEnter`
- Bell badge: unread count signal, clears (sets to 0) when user opens case detail

### Stage 2: Implement
- Extend `ConversationComposerComponent`: watch `text` signal for `@` pattern → emit `mentionQuery` output
- `ConversationPanelComponent`: handle `mentionQuery` → filter `case_participants` signal → show dropdown
- `MentionDropdownComponent` (presentational): `participants = input<Participant[]>()`, `mentionSelected = output<Participant>()`
- On participant selected: insert `@{display_name}` at cursor position in composer text
- After `ConversationService.sendMessage()` succeeds: extract @-mentions from text → call `supabase.functions.invoke('notify-mention', { body: { mentionedUserIds, messageText, caseId } })`
- Edge Function `notify-mention`: stub that logs to console for hackathon; email dispatch optional
- `NotificationBellComponent`: queries unread count signal from `CaseDetailStore`; badge hidden when 0
- `CaseDetailStore`: compute `unreadCount = messages.length - (messagesAtLastVisit)` on enter; reset on enter

### Stage 3: Test
- Type `@` in composer → dropdown shows case participants
- Select participant → `@Name` inserted in composer text
- Send message with @mention → Edge Function invoked (check Supabase function logs)
- Bell badge shows correct unread count before opening case
- Open case → bell count resets to 0
- New message arrives via Realtime while viewing case → bell stays 0 (already viewing)
- New message arrives in another tab → bell increments on next visit
