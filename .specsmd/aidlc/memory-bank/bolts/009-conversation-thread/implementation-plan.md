---
stage: plan
bolt: 009-conversation-thread
created: 2026-06-25T00:00:00Z
---

## Implementation Plan: Conversation Thread — Rendering + Composer

### Objective

Fill the two `panel-conversation` slots in `case-detail.page.html` (mobile tab + desktop right-panel) with a live conversation thread and message composer. Messages come from `CaseDetailStore.messages()` (already loaded and Realtime-updated by Bolt 006). New messages are sent optimistically.

### Deliverables

1 - **`MessageService`** at `client/src/app/core/message/message.service.ts`
   - `sendMessage(caseId: string, content: string, authorId: string): Promise<ConversationMessage>` — inserts to `conversation_messages`, returns the persisted row

2 - **`SystemMessageComponent`** at `client/src/app/components/conversation/system-message/system-message.component.ts`
   - Presentational; `message = input<ConversationMessage>()`
   - Renders: centred, small, italic, muted — e.g. "Case imported from IMC: Riverside Commons"

3 - **`MessageBubbleComponent`** at `client/src/app/components/conversation/message-bubble/message-bubble.component.ts`
   - Presentational; `message = input<ConversationMessage>()`, `isOwn = input<boolean>()`
   - `isOwn` true → bubble floats right; false → floats left
   - Shows: author display name, timestamp, content body

4 - **`MessageComposerComponent`** at `client/src/app/components/conversation/message-composer/message-composer.component.ts`
   - Presentational; `send = output<string>()`
   - Native `textarea` (auto-grow via `input` event), Send button disabled when empty
   - Emits trimmed text string on Send; clears field after emit

5 - **`ConversationPanelComponent`** at `client/src/app/components/conversation/conversation-panel/conversation-panel.component.ts`
   - Smart component; `caseId = input<string>()`
   - Injects `CaseDetailStore`, `AuthService`, `MessageService`
   - Renders `SystemMessageComponent` or `MessageBubbleComponent` per message type
   - Auto-scrolls to bottom sentinel `div` via `effect()` watching `messages().length`
   - On composer `send` output: optimistic append → `MessageService.sendMessage()` → rollback on error

6 - **Wire into `case-detail.page.html`**: replace both `empty-slot` placeholder divs with `<app-conversation-panel [caseId]="caseId" />`
   - Import `ConversationPanelComponent` in `CaseDetailPage`

### Dependencies

1 - **`CaseDetailStore.messages()`** — already populated by `loadCase()` and Realtime `appendMessage()` in Bolt 006; read-only from this bolt
2 - **`ConversationMessage` type** from `core/cases/case.models.ts` — fields: `id`, `authorId` (null=system), `type` ('system'|'message'), `content`, `createdAt`
3 - **`AuthService.currentUser()`** — `id` used to determine own vs other bubble alignment
4 - **`CaseDetailStore.participants()`** — display names for bubble author label; available now, no extra fetch needed

### Technical Approach

- **Message type discrimination**: `msg.type === 'system'` → `SystemMessageComponent`; else → `MessageBubbleComponent` with `isOwn = msg.authorId === currentUserId()`
- **Author display name**: resolve from `store.participants()` by `userId === msg.authorId`; fallback to "HFA Staff" / "Participant" if not found
- **Auto-scroll**: `ViewChild` refs a `#scrollAnchor` div at list bottom; `effect(() => { store.messages(); scrollAnchor?.scrollIntoView() })` — guard with `isPlatformBrowser()`
- **Optimistic send**: generate temp ID (`crypto.randomUUID()`), append to store, call service, on error filter temp message out; on success replace temp with persisted row
- **Composer grow**: `textarea` with `rows="1"` + CSS `resize: none; overflow: hidden`; `(input)` handler sets `style.height = 'auto'; style.height = el.scrollHeight + 'px'`
- **No `IonTextarea`** — plain `<textarea>` per coding standards (Ionic shell-only)

### Acceptance Criteria

- [ ] Conversation tab renders existing seed system message "Case imported from IMC…" in muted italic style
- [ ] Manual messages render as chat bubbles — own messages right-aligned, others left-aligned
- [ ] Composer textarea is disabled/Send button disabled when empty
- [ ] Typing text and clicking Send appends message immediately (optimistic) and persists to DB
- [ ] After send, textarea clears and thread scrolls to bottom
- [ ] Opening second browser tab: new message sent in tab A appears live in tab B via Realtime (no refresh)
- [ ] Thread auto-scrolls to bottom on any new message (sent or received via Realtime)
