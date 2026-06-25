---
id: 005-participants-tab
unit: 005-case-detail-shell
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 005-participants-tab

## User Story
**As any** case participant
**I want** to see all people on a case in a grouped, readable list and — if I am HFA — add or remove them
**So that** I always know who is involved and can manage the team without leaving the case

## Acceptance Criteria

### Tab and layout
- [ ] **Given** the case detail screen, **When** rendered on any viewport, **Then** "Participants" is the third content tab (mobile toggle: `Actions | Conversation | Participants`; tablet/desktop: right panel sub-tab bar `Conversation | Participants`)
- [ ] **Given** the Participants tab is active, **When** the list renders, **Then** participants are grouped into up to three labelled sections: **YOUR AGENCY [n]**, **DEVELOPER [n]**, **OTHER PARTICIPANTS [n]** — sections with 0 members are hidden
- [ ] **Given** the list is long, **When** it overflows the viewport, **Then** the list scrolls independently; the "Add participant" CTA remains sticky at the bottom of the screen (HFA only)

### Participant rows
- [ ] **Given** each participant row, **When** rendered, **Then** it shows: a colored avatar circle with the participant's initials (color deterministic from name), display name, role/title, and email address
- [ ] **Given** the logged-in user's own row, **When** rendered, **Then** a "YOU" badge is shown inline next to the display name and a lock icon (🔒) replaces the action icon — the current user cannot remove themselves
- [ ] **Given** any other participant row viewed by an HFA user, **When** rendered, **Then** a red trash icon (🗑️) is shown at the end of the row; tapping it removes that participant
- [ ] **Given** a participant row viewed by a non-HFA user, **When** rendered, **Then** no trash icon or add button is shown — the list is read-only

### Grouping logic
- YOUR AGENCY: participants where `contact_role` is an HFA role AND `hfa_id` matches the case's `hfa_id`
- DEVELOPER: participants where `contact_role = 'developer'`
- OTHER PARTICIPANTS: all other roles (GC, Inspector, Architect, Title Company, Lender, etc.)

### Add participant (HFA only)
- [ ] **Given** an HFA user views the Participants tab, **When** it renders, **Then** a full-width "Add participant" button (person-add icon + label) is shown sticky at the bottom of the screen
- [ ] **Given** the HFA taps "Add participant", **When** the tap fires, **Then** an inline form appears above the CTA (not a modal) with: email address field, role/type selector, and "Send invite" + "Cancel" buttons
- [ ] **Given** the HFA enters a valid email and role and taps "Send invite", **When** the action succeeds, **Then** the new participant row is added to the correct section with "Pending" status; a system message "HFA added [name/email] as [role]" is written to `conversation_messages`; the participant receives an email invitation via the `notify-participant-added` Edge Function
- [ ] **Given** the disclaimer text below the CTA, **When** rendered, **Then** it reads: "Added participants get an email invitation and can view the case & respond to items assigned to them."

### Remove participant (HFA only)
- [ ] **Given** the HFA taps the trash icon on a participant row, **When** the tap fires, **Then** an inline confirmation appears ("Remove [name]?") with "Remove" and "Cancel" options — no modal
- [ ] **Given** the HFA confirms removal, **When** the action succeeds, **Then** the participant row is removed from the list; a system message "HFA removed [name] from the case" is written to `conversation_messages`
- [ ] **Given** the participant being removed is the only Developer on an IMC-backed case, **When** the HFA attempts removal, **Then** the action is blocked with an inline message: "Cannot remove the only Developer from an IMC-backed case"

### Conversation tab unread badge
- [ ] **Given** the case detail screen, **When** unread messages exist since the user's last visit, **Then** a numeric badge is shown on the "Conversation" tab label (e.g. `Conversation [7]`)
- [ ] **Given** the user taps the Conversation tab, **When** the tab activates, **Then** the badge clears to 0

## Technical Notes
- `ParticipantsTabComponent` — standalone component rendered in the right panel's Participants tab slot
- `CaseDetailStore.participants = signal<CaseParticipant[]>([])` — already queried on case load
- Grouping: `computed()` signals deriving three filtered arrays from `participants()`
- Avatar color: deterministic from display name — hash first char of first + last name to pick from a fixed palette of 8 colors (no randomness at render time)
- "YOU" detection: `participant.userId === currentUser.id`
- `addParticipant(caseId, email, role)`: query `profiles` by email; if not found create placeholder; INSERT `case_participants`; write system message; Edge Function `notify-participant-added`
- `removeParticipant(caseId, participantId)`: DELETE `case_participants`; write system message
- Inline add form: `addFormOpen = signal(false)`; absolutely positioned above sticky CTA; close on Cancel or success
- Inline remove confirmation: `removingParticipantId = signal<string | null>(null)`; shown inline in the row
- Conversation tab badge: `unreadCount = computed(() => messages().filter(m => m.createdAt > lastReadAt()).length)`; driven by `CaseDetailStore`
- Schema note: `cases.reference_number TEXT` — store IMC project reference (e.g. "Lotus #MF-2024-0188"); populated from IMC stub data on import; manually entered for blank cases (optional field in story 003-confirm-and-participants)

## Dependencies
### Requires
- `001-two-panel-layout` (Participants tab slot must exist in the layout)
- `004-data-loading-and-realtime` (`CaseDetailStore.participants` signal)
### Enables
- None — Participants tab is a leaf feature

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Case has only HFA participants (no developer yet) | YOUR AGENCY section shown; DEVELOPER section hidden; add form available |
| Participant has no display name yet (pending invite) | Email shown in place of name; avatar shows first 2 chars of email; "Pending" label below email |
| HFA adds an email already in `case_participants` | Blocked client-side: "This person is already a participant" |
| Non-HFA user taps participant row | No action — row is not interactive beyond display |

## Out of Scope
- Editing a participant's role after they have been added (post-hackathon)
- Bulk participant import
- Participant permissions beyond role
