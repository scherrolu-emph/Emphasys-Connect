---
id: "009"
unit: 007-conversation-thread
intent: 001-construction-milestone-workspace
type: simple-construction-bolt
status: planned
stories:
  - 001-thread-rendering
  - 002-message-composer
created: 2026-06-24T00:00:00Z
requires_bolts: ["006"]
enables_bolts: ["010"]
requires_units: []
blocks: false
complexity:
  estimate: medium
  reason: Chronological thread rendering with system/manual message differentiation, composer with optimistic send, auto-scroll
---

# Bolt 009 — Conversation Thread: Rendering + Composer

## Objective

Build the conversation panel: chronological thread of system events and manual messages, plus the message composer with optimistic send and auto-scroll to bottom.

## Stories in Scope

| Story | Title | Priority |
|-------|-------|----------|
| 001-thread-rendering | Chronological thread: system + manual messages | Must |
| 002-message-composer | Text input, send, optimistic update | Must |

## Stage Sequence (simple-construction-bolt)

### Stage 1: Plan
- Thread: `conversation_messages` ordered by `created_at` ASC; all in one flat list
- Visual differentiation: system messages (type: `system`) = small grey italic center-aligned; manual messages = chat bubble left (Developer) or right (HFA)
- Composer: `textarea` (grows with content) + "Send" button; disabled while empty
- Optimistic send: append message to `messages` signal immediately, then insert to Supabase; rollback on error
- Auto-scroll: after new message appended, scroll to bottom; use `ViewChild` + `scrollIntoView` (guard with `isPlatformBrowser()`)
- Thread re-renders on Realtime insert to `conversation_messages` (already wired in `CaseDetailStore`)

### Stage 2: Implement
- `ConversationThreadComponent` (standalone, presentational): `messages = input<ConversationMessage[]>()`
- `@for (msg of messages; track msg.id)` → `MessageBubbleComponent` or `SystemMessageComponent` based on `msg.type`
- `MessageBubbleComponent`: left/right alignment via `msg.sender_id === currentUser.id`
- `SystemMessageComponent`: italic text, no avatar
- `ConversationComposerComponent` (standalone): `text = signal('')`; "Send" calls `output()` emit
- `ConversationPanelComponent`: smart component — owns composer output, calls `ConversationService.sendMessage(caseId, text)`
- `ConversationService.sendMessage()`: optimistic signal update → Supabase insert
- Auto-scroll: `afterRender` or `effect()` watching messages signal length

### Stage 3: Test
- Thread shows seed system message "Case imported from IMC..."
- System messages styled differently from chat bubbles
- Type message → "Send" enables → click → message appears immediately (optimistic), persists in DB
- Second browser tab: sender's message appears live via Realtime
- Thread scrolls to bottom after new message
- Empty composer → Send button disabled
