---
id: 004-developer-status-panel
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 004-developer-status-panel

## User Story
**As a** Developer (external partner)
**I want** to see milestone progress and prerequisites assigned to them in a read-only status panel
**So that** I always know exactly what is outstanding, what is under review, and what has been accepted without needing to contact the HFA

## Acceptance Criteria
- [ ] **Given** a Developer user views the case, **When** the Status panel loads, **Then** a list of milestones is shown with Open/Active/Complete badges
- [ ] **Given** the active milestone, **When** prerequisites are shown, **Then** each displays a status badge matching its current state
- [ ] **Given** a `document_submission` prerequisite in `pending_open` with an `edocs_upload_url` set, **When** the Developer views the Status panel, **Then** an "Upload document" anchor link pointing to the upload URL is shown
- [ ] **Given** a `document_submission` prerequisite in `received_processing`, **When** the Developer views the Status panel, **Then** an "Under review" badge is shown (no upload link)
- [ ] **Given** a prerequisite with status `accepted`, **When** the Developer views the Status panel, **Then** a green "Accepted" badge is shown
- [ ] **Given** any prerequisite, **When** the Developer views the Status panel, **Then** no Accept, Return, or Request Document action buttons are rendered

## Technical Notes
- Reads from the same `CaseDetailStore` signals as the HFA Actions panel
- `@if (!isHfa())` guards all HFA action buttons
- Upload link is a plain `<a>` tag with `target="_blank"`; guard with `isPlatformBrowser()` for Capacitor compatibility
- "Confirm upload" stub button (for hackathon) triggers `PrerequisiteService.confirmUpload(prereqId)`

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
