---
id: 005-milestone-auto-advance
unit: 006-milestone-prereq-flow
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-24T00:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 005-milestone-auto-advance

## User Story
**As a** system (triggered by HFA accept action)
**I want** to automatically complete the current milestone and activate the next one when all prerequisites are accepted
**So that** milestone progression is automatic and both parties see it happen live without manual intervention

## Acceptance Criteria
- [ ] **Given** the last prerequisite of the active milestone is accepted, **When** `MilestoneService.checkAndAdvance(milestoneId)` runs, **Then** the milestone status flips to `completed` and a system message "Milestone [title] completed" is written to `conversation_messages`
- [ ] **Given** the current milestone completes and a next milestone exists (by `sequence_order`), **When** the advance runs, **Then** the next milestone status flips to `active` and a system message "Milestone [title] is now active" is written
- [ ] **Given** the current milestone completes and no next milestone exists, **When** the advance runs, **Then** a system message "All milestones complete — case is ready for final review" is written
- [ ] **Given** any of the above transitions, **When** Realtime broadcasts the changes, **Then** both HFA and Developer views update live without page refresh

## Technical Notes
- `MilestoneService.checkAndAdvance(milestoneId)` called inside `PrerequisiteService.accept()` after the accept write
- Check: query all prerequisites for the milestone; if every row has `status = 'accepted'`, proceed with advance
- Update current milestone + next milestone in same Supabase transaction (or sequential writes with compensating logic on failure)
- System messages written as part of the same operation batch

## Dependencies
### Requires
- `002-accept-and-return-actions`
### Enables
- None (terminal story in this unit)

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Two HFA users accept the final prerequisite simultaneously | First write succeeds; second is a no-op (milestone already `completed`); no duplicate system messages |
| Sequence gap in `sequence_order` values | Query uses `WHERE sequence_order > current ORDER BY sequence_order LIMIT 1`; gap has no effect |
| All prerequisites already accepted when page loads (edge case from data migration) | `checkAndAdvance` is idempotent; running it again produces no duplicate messages if milestone is already `completed` |

## Out of Scope
- Manual milestone override by HFA admin
- Milestone rollback
