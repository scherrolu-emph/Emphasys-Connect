---
stage: plan
bolt: "007"
created: 2026-06-25T00:00:00Z
---

## Implementation Plan: Milestone/Prereq Display Panels

### Objective

Build two presentational panel components — `HfaActionsPanelComponent` (HFA staff view with prerequisite checklist and status badges) and `ParticipantStatusPanelComponent` (Developer read-only view with upload links and "Mark as ready" button) — and wire them into the existing `CaseDetailComponent` slots from Bolt 006.

### Deliverables

- `HfaActionsPanelComponent` — standalone component displaying the active milestone and its prerequisites with expandable accordion rows, type icons, and status badges
- `ParticipantStatusPanelComponent` — standalone component displaying all milestones/prereqs read-only; shows upload links and "Mark as ready" button for `acceptance_comment` prereqs in `pending_open`
- `PrereqStatusBadgeComponent` — shared standalone badge component mapping prerequisite status to color and label
- `MilestoneStatusBadgeComponent` — shared standalone badge component for milestone open/active/completed states
- Both panels wired into `CaseDetailComponent` (mobile tab + desktop left panel slots)
- `MilestoneWithPrereqs` type alias (if not already in models) ensuring panels receive typed data

### Dependencies

- `CaseDetailStore.caseDetail()` signal — provides `CaseDetail` with `milestones: MilestoneDetail[]` and `activeMilestone: MilestoneDetail | null`
- `MilestoneDetail` and `PrerequisiteSummary` interfaces — already defined in `case.models.ts`; no new types needed
- `AuthService.isHfa()` — controls which panel is rendered in `CaseDetailComponent`
- Bolt 006 `CaseDetailComponent` slot placeholders — both panels slot directly into existing `<div class="empty-slot">` placeholders

### Technical Approach

**HFA Actions Panel**

- Accepts `milestones = input<MilestoneDetail[]>()` from `CaseDetailComponent` (passed from store signal)
- Computes `activeMilestone` internally as the first `active` milestone; shows empty state if none
- Accordion pattern: `expandedPrereqId = signal<string | null>(null)`; only one prereq expanded at a time
- Collapsed row: prereq title + type icon + status badge
- Expanded row: adds action button placeholders (disabled `<button>` elements; handlers wired in Bolt 008)
- Empty states: "All milestones complete" when all milestones are `completed`; "No milestones yet" when array is empty; "No prerequisites defined" when active milestone has empty prereqs array
- No milestone status pill on the milestone header (per story AC)

**Participant Status Panel**

- Accepts `milestones = input<MilestoneDetail[]>()` — same data structure as HFA panel
- No accordion — all prereqs visible inline; no action buttons except "Mark as ready" and upload link
- Upload link: `<a href="{{prereq.uploadLink}}" target="_blank">Upload document</a>` shown only when `prereq.type === 'document_submission' && prereq.status === 'pending_open' && prereq.uploadLink`
- "Mark as ready" button: shown for `acceptance_comment` prereqs in `pending_open`; emits `markReady = output<string>()` (prereqId); handler wired in Bolt 008
- All milestone open/active/completed badges shown (not accordion-collapsed per milestone)

**Shared Badge Components**

- `PrereqStatusBadgeComponent`: input `status: PrerequisiteSummary['status']`; maps to label + CSS class:
  - `pending_open` → "Pending" + `.badge-neutral` (grey)
  - `received_processing` → "Received — Under Review" + `.badge-caution` (amber `#F59E0B`)
  - `accepted` → "Accepted" + `.badge-success` (green `#22C55E`)
- `MilestoneStatusBadgeComponent`: input `status: MilestoneDetail['status']`; maps to:
  - `open` → "Upcoming" + `.badge-neutral`
  - `active` → "In Progress" + `.badge-accent` (blue `#1593D8`)
  - `completed` → "Complete" + `.badge-success`

**CaseDetailComponent integration**

- Derive `isHfa` from `AuthService` — already present in page component
- Replace `<div class="empty-slot">Actions panel — coming in Bolt 007</div>` with `@if (isHfa())` / `@else` guard selecting the correct panel
- Pass `store.caseDetail()?.milestones ?? []` as the `milestones` input

### Acceptance Criteria

- [ ] HFA Actions panel shows the active milestone title with collapsed prereq rows (title + type icon + badge only)
- [ ] Tapping a prereq row expands it (accordion, only one open at a time); tapping again collapses it
- [ ] Status badges show correct colors: Pending=grey, Received—Under Review=amber, Accepted=green
- [ ] Document prereqs show paperclip icon; comment prereqs show checkmark icon
- [ ] "All milestones complete" empty state shown when no active milestone and all are completed
- [ ] "No milestones yet" shown when milestones array is empty
- [ ] No milestone-level status pill on the header row
- [ ] Participant Status panel shows all milestones with open/active/completed badges
- [ ] Upload link appears only for `document_submission` prereqs in `pending_open` with a non-null `uploadLink`
- [ ] "Mark as ready" button appears for `acceptance_comment` prereqs in `pending_open`; clicking emits `markReady` output (handler pending Bolt 008)
- [ ] Both panels slot correctly into CaseDetailComponent on mobile (tab) and desktop (left panel)
- [ ] Realtime badge update: changing prereq status in Supabase Studio refreshes badge within 2s (Realtime already wired in Bolt 006)
