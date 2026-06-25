---
id: 004-participant-status-panel
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 004-participant-status-panel

## User Story
**As a** case participant (Developer for the hackathon; any partner type in production)
**I want** to see milestone progress and prerequisites assigned to me in a read-only status panel
**So that** I always know exactly what is outstanding, what is under review, and what has been accepted without needing to contact the HFA

## Acceptance Criteria
- [ ] **Given** a non-HFA participant views the case, **When** the Status panel loads, **Then** a list of milestones is shown with Open/Active/Complete badges
- [ ] **Given** the active milestone, **When** prerequisites are shown, **Then** each displays a status badge matching its current state
- [ ] **Given** a `document_submission` prerequisite in `pending_open` with an `edocs_upload_url` set, **When** the participant views the Status panel, **Then** an "Upload document" anchor link pointing to the upload URL is shown
- [ ] **Given** a `document_submission` prerequisite in `received_processing`, **When** the participant views the Status panel, **Then** an "Under review" badge is shown (no upload link)
- [ ] **Given** a prerequisite with status `accepted`, **When** the participant views the Status panel, **Then** a green "Accepted" badge is shown
- [ ] **Given** any prerequisite, **When** the participant views the Status panel, **Then** no Accept, Return, or Request Document action buttons are rendered
- [ ] **Given** an `acceptance_comment` prerequisite in `pending_open`, **When** the participant views the Status panel, **Then** a **"Mark as ready"** button is shown alongside the prerequisite
- [ ] **Given** the participant taps "Mark as ready", **When** the action completes, **Then** the prerequisite status flips to `received_processing`, a system message "[participant name] marked [prereq title] as ready for review" is written, and the button is replaced by an "Under review" badge

## Technical Notes
- `ParticipantStatusPanelComponent` — standalone; reads from `CaseDetailStore` signals
- `@if (!isHfa())` guards all HFA action buttons
- Upload link is a plain `<a>` tag with `target="_blank"`
- "Confirm upload" stub button (for hackathon) triggers `PrerequisiteService.confirmUpload(prereqId)`
- "Mark as ready" calls `PrerequisiteService.markReady(prereqId)` — sets status to `received_processing` and writes system message; same atomicity requirement as all other mutations

## Hackathon note
`acceptance_comment` "Mark as ready" is the permanent participant action in both v1 and v2. The HFA accept/return that follows it is a **hackathon shortcut** — in v2, HFA approval happens in IMC and is synced back to Supabase (see story 002-accept-and-return-actions).

## Dependencies
### Requires
- `005/004-data-loading-and-realtime`
### Enables
- `003-trigger-document-request` (upload URL visibility)
- `005-milestone-auto-advance`

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| No milestones defined for the case | "No milestones have been defined yet" empty state shown |
| Upload URL is present but prerequisite status is not `pending_open` | Link hidden; badge reflects actual status |

## Out of Scope
- HFA-only action buttons
- Milestone creation or editing
