---
id: 003-trigger-document-request
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 003-trigger-document-request

## User Story
**As a** HFA staff
**I want** to generate an eDocs upload link for a document_submission prerequisite and notify the Developer
**So that** I can initiate the document collection step without leaving the platform

## Acceptance Criteria
- [ ] **Given** a `document_submission` prerequisite in `pending_open` status, **When** the HFA views the Actions panel, **Then** a "Request document" button is shown for that prerequisite
- [ ] **Given** the HFA taps "Request document", **When** the Edge Function responds, **Then** `edocs_upload_url` is stored on the prerequisite row and a system message "Upload link sent for [prereq title]" is written to `conversation_messages`
- [ ] **Given** the upload URL has been generated, **When** the Developer views the Status panel, **Then** the upload link for that prerequisite is visible as a clickable link
- [ ] **Given** the Developer clicks "Confirm upload" (hackathon stub), **When** the action completes, **Then** the prerequisite flips to `received_processing` and a system message "Developer uploaded [prereq title]" is written

## Technical Notes
- Edge Function `generate-upload-url` is a stub that returns `https://mock-edocs.local/upload/{prereqId}` for the hackathon
- Real eDocs integration is post-hackathon scope
- "Confirm upload" button is a Developer-only stub button in the Status panel (story 004)
- System message written by the Edge Function or by the client after the function returns

## Dependencies
### Requires
- `001-hfa-actions-panel`
- `004-developer-status-panel`
### Enables
- `002-accept-and-return-actions` (prerequisite moves to `received_processing` after upload)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Edge Function call times out | Error toast shown; no URL stored; button re-enabled |
| HFA taps "Request document" twice | Second call is a no-op if `edocs_upload_url` already set; idempotency check in Edge Function |
| Developer clicks upload link but eDocs session expires | External concern; out of scope for hackathon |

## Out of Scope
- Real eDocs API integration
- Automatic email notification on link generation (post-hackathon)
