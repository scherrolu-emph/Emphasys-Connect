---
id: 004-milestone-count-display
unit: 003-hfa-dashboard
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-25T12:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 004-milestone-count-display

## User Story

**As an** HFA staff member
**I want** to see how many milestones have been completed out of the total on each case card
**So that** I can quickly assess overall case progress without opening the detail view

## Acceptance Criteria

- [ ] **Given** the HFA dashboard case list, **When** a case card renders, **Then** the progress indicator shows "X of Y milestones completed" (e.g. "2 of 4 milestones completed") instead of a prerequisite percentage
- [ ] **Given** a case with no completed milestones, **When** the card renders, **Then** it displays "0 of Y milestones completed"
- [ ] **Given** a case where all milestones are completed, **When** the card renders, **Then** it displays "Y of Y milestones completed"
- [ ] **Given** the progress indicator, **When** rendered, **Then** the format is consistent across all case cards and legible on mobile

## Technical Notes

- Replace current prereq-based progress calculation in the case list component with: `completedMilestones / totalMilestones`
- A milestone is "completed" when `status === 'completed'`
- Data is already available on the case query — no additional DB call needed
- Update the display string in the case card template; remove the old percentage pipe if unused elsewhere

## Dependencies

### Requires
- `001-case-list-screen`

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Case has 0 milestones (blank case) | Display "No milestones" or hide the indicator |
| Case has only 1 milestone | "0 of 1 milestones completed" / "1 of 1 milestones completed" |

## Out of Scope

- Per-milestone progress breakdown on the dashboard card
- Changing milestone count display in the case detail view
