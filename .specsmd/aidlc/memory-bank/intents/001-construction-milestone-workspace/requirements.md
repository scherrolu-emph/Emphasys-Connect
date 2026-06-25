---
intent: 001-construction-milestone-workspace
phase: construction
status: complete
created: 2026-06-24T00:00:00Z
updated: 2026-06-25T00:00:00Z
---

# Requirements: Construction Milestone Workspace

## Intent Overview

The core product experience of Emphasys Connect. HFA staff import a funded project from IMC and coordinate with the Developer through a shared milestone/prerequisite workspace. Both parties share a live conversation thread that mixes system events (prerequisite activations, upload confirmations, status changes) with manual messages. The Developer receives upload links, submits documents via eDocs, and watches the milestone progress in real time — replacing the broken status quo of email + spreadsheet coordination.

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Replace email/spreadsheet coordination with a shared workspace | All case state visible in one screen; zero emails required to signal a status change | Must |
| Prove live real-time updates (the hero demo moment) | Developer uploads document → HFA conversation thread updates within 1 second, no page refresh | Must |
| Give HFA staff clear milestone/prerequisite visibility | Active milestone and outstanding prerequisites visible without opening individual items | Must |
| Enable structured async communication between HFA and Developer | Messages and system events in one thread; no separate email chain needed | Must |
| Import case structure from IMC | HFA selects an IMC project and case/milestones/prerequisites are created in seconds | Must |

---

## Functional Requirements

### FR-1: Passwordless Authentication
- **Description**: Users enter their email address and receive a 6-digit OTP. Entering the correct code grants a session. HFA accounts (`is_hfa: true`) see the full HFA interface; Developer accounts see the Developer interface. Users with no cases see a meaningful empty state.
- **Acceptance Criteria**: Email entry screen sends OTP; OTP entry screen validates code; correct code → authenticated session; `is_hfa` determines which UI is shown; invalid code shows plain-English error; empty state renders for users with no case assignments.
- **Priority**: Must

### FR-2: HFA Dashboard — Case List
- **Description**: Authenticated HFA staff see all active cases for their org. Each row shows: project title, type badge (Loan / Inspection / Application), active milestone name, overdue prerequisite count (red badge if > 0), milestone progress indicator. Cases with overdue prerequisites have a red left border. A type filter narrows the list.
- **Acceptance Criteria**: Dashboard loads all cases; overdue count is accurate (prerequisites past target_days and not accepted); type filter hides non-matching cases; tapping a case navigates to Case Detail.
- **Priority**: Must

### FR-3: Import Case from IMC
- **Description**: HFA staff tap "Import from IMC" to see a picker of projects available in their IMC instance. Each row shows project name, address, developer contact. On selection, a confirm screen shows the milestone/prerequisite structure. On confirm, the case and all milestones/prerequisites are created in Supabase. The developer contact is invited (notified by email).
- **Acceptance Criteria**: IMC picker shows available projects; confirm screen shows milestone preview; import creates case + milestones + prerequisites; developer is notified; system message appears in the conversation thread ("Case imported from IMC: [project name]").
- **Priority**: Must (IMC connection may be stubbed for hackathon with seeded data)

### FR-4: Case Detail — HFA Two-Panel View
- **Description**: HFA case detail has two panels. **Actions panel**: active milestone, prerequisite list with statuses, action controls (trigger document request, accept, return with note). **Conversation panel**: chronological thread mixing system messages and manual HFA↔Developer messages, with composer at bottom. On mobile, panels stack with a toggle to switch between them.
- **Acceptance Criteria**: Both panels render; actions panel shows active milestone and its prerequisites with correct statuses; conversation panel shows full thread in chronological order; mobile layout reflows to single column; panel toggle works on mobile.
- **Priority**: Must

### FR-5: Case Detail — Developer View
- **Description**: Developer case detail has two panels. **Status panel**: read-only milestone progress, prerequisites assigned to this developer with their current status and upload links. **Conversation panel**: same thread as HFA view with composer. Developer cannot trigger actions (no accept/return/activate controls).
- **Acceptance Criteria**: Developer sees milestone progress and their prerequisites; upload links visible for active document_submission prerequisites; no HFA-only controls rendered; conversation thread matches HFA view.
- **Priority**: Must

### FR-6: Milestone Status Flow
- **Description**: Milestones progress: `open → active → completed`. Only one milestone is `active` per case at a time. When all prerequisites for the active milestone are `accepted`, the milestone moves to `completed` and the next milestone becomes `active`. Each transition writes a system message to the conversation thread and broadcasts via Supabase Realtime.
- **Acceptance Criteria**: Only one active milestone shown at a time; completing all prerequisites triggers milestone completion automatically; next milestone activates; system message appears in thread; Realtime broadcast updates both HFA and Developer views without page refresh.
- **Priority**: Must

### FR-7: Prerequisite Status Flow — Document Submission
- **Description**: Document submission prerequisites flow: `pending_open → received_processing → accepted` (or back to `pending_open` on rejection). When a prerequisite is activated, the developer receives an email notification containing an upload link. The link opens the eDocs upload interface scoped to this prerequisite. On successful upload, the prerequisite flips to `received_processing` and a system message appears. HFA reviews in IMC (or in-app) and accepts or rejects. Rejection reverts to `pending_open` with HFA notes.
- **Acceptance Criteria**: Upload link delivered to developer on prerequisite activation; upload via eDocs flips status to `received_processing`; system message appears; HFA accept action flips to `accepted`; HFA reject reverts to `pending_open` with note visible in thread; all transitions broadcast via Realtime.
- **Priority**: Must (eDocs upload may be stubbed for hackathon with a mock confirmation)

### FR-8: Prerequisite Status Flow — Acceptance Comment
- **Description**: Acceptance comment prerequisites require written confirmation rather than a document upload. Developer provides a comment in the conversation thread referencing the prerequisite. HFA accepts or rejects. No upload link generated.
- **Acceptance Criteria**: No upload link shown for `acceptance_comment` type prerequisites; HFA can accept or return with note; transitions broadcast via Realtime.
- **Priority**: Must

### FR-9: Manual Messaging (HFA ↔ Developer)
- **Description**: Both HFA staff and the Developer can post manual messages in the case conversation thread. Messages appear in chronological order, interleaved with system messages. Each message shows author name, contact role, and timestamp.
- **Acceptance Criteria**: HFA can post message; Developer can post message; messages appear for both parties in real time via Realtime without page refresh; author name + role + timestamp rendered correctly.
- **Priority**: Must

### FR-10: Supabase Realtime — Live Thread Updates
- **Description**: The case conversation thread updates live for all participants. When any message (system or manual) is added to `conversation_messages`, or when a prerequisite/milestone status changes, Supabase Realtime broadcasts to all connected clients for that case. No polling fallback.
- **Acceptance Criteria**: New message by HFA appears on Developer's screen without refresh; prerequisite status change updates Developer's status panel without refresh; all broadcasts arrive within 1 second under local dev conditions.
- **Priority**: Must

### FR-11: @-Mentions and Notification Bell
- **Description**: In the conversation thread composer, users can type `@` to trigger autocomplete showing case participants (HFA staff, Developer). Sending a message with an @-mention triggers an email notification to the mentioned participant. A bell icon in the header shows the count of unread thread messages since the user last viewed the case. The bell clears when the user opens the conversation panel.
- **Acceptance Criteria**: `@` in composer shows participant autocomplete; sending a @-mention dispatches an email notification to that participant (via Edge Function); bell icon shows unread count; count clears on case open; both work for HFA and Developer.
- **Priority**: Must

---

## Non-Functional Requirements

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Case detail load | Time to interactive | < 1s on local dev |
| Realtime event delivery | Latency from DB write to UI update | < 1 second |
| Conversation thread | Initial load | ≤ 50 messages, paginated |

### Security
| Requirement | Standard | Notes |
|-------------|----------|-------|
| Authentication | Supabase passwordless OTP | 6-digit code via email |
| Authorization | Supabase RLS policies | HFA flag gates HFA-only actions; case participants gate case access |
| Multi-tenancy | `hfa_id` on all entities + RLS enforced | Not mocked — enforced from day one |
| API keys | Supabase anon key only in client | Service role key only in Edge Functions; never in client bundle |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Realtime connection | Reconnection on drop | Supabase client auto-reconnects; no manual refresh required during demo |
| Status mutations | Atomicity | Prerequisite/milestone update and system message insert in same Supabase transaction |

---

## Constraints

### Technical Constraints
- `hfa_id` must be present on every new entity
- All prerequisite/milestone mutations must insert a `conversation_message` row in the same operation
- No polling fallback for Supabase Realtime — real-time is load-bearing for the demo
- App never stores documents — all files route through eDocs
- Ionic components used for shell chrome only; no `IonModal`, `IonActionSheet`, `IonAlert`
- Supabase anon key must not be committed to source control

### Business Constraints
- 2-day hackathon timeline
- Two personas only: HFA staff and Developer
- No case creation UI — cases imported from IMC (or seeded for hackathon)
- No document storage — eDocs handles all uploads
- No participant removal UI (schema supports it; UI not built)

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| IMC integration can be stubbed with seeded data for the hackathon | Demo fails if live IMC not available | Seed 1 case with 2 milestones and prerequisites; design IMC picker to work against stub data |
| eDocs upload can be mocked with a "confirm upload" button for the hackathon | Document flow incomplete in demo | Mock button updates prerequisite status identically to real upload; visually indistinguishable |
| Supabase Realtime WebSocket works in local dev network | Demo fails to show live updates | Verify in DevTools Network tab pre-demo |
| OTP email delivery can be simulated (Supabase local SMTP) | Login fails during demo | Pre-authenticate both demo accounts before demo starts; keep sessions alive |

---

## Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| Confirm activity log vs. conversation thread: fully retiring folded notes-on-items? | Team | 2026-06-24 | ✅ Fully flat thread — one stream per case, no sub-threads or folding |
| Confirm Building/draw brief is shelved; hackathon uses simpler milestone/prerequisite structure | Bogdan / Alan | 2026-06-24 | ✅ Shelved — milestone/prereq only; draw package is a future phase |
| Where do prerequisite/milestone edits happen — IMC only, or allow in-app edits too? | Team | 2026-06-24 | ✅ IMC only — app is read/orchestrate; no structural edits inside the app |
| Keep @-mentions and notification bell, or defer? | Team | 2026-06-24 | ✅ Keep both (simplified) — @-mention triggers email notification; bell shows unread count (see FR-11) |
