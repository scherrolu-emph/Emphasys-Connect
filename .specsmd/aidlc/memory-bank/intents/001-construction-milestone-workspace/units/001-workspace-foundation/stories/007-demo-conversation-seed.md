---
id: 007-demo-conversation-seed
unit: 001-workspace-foundation
intent: 001-construction-milestone-workspace
status: complete
priority: must
created: '2026-06-25T12:00:00Z'
assigned_bolt: null
implemented: true
---

# Story: 007-demo-conversation-seed

## User Story

**As a** demo presenter
**I want** the conversation threads and activity feed to be pre-populated with realistic messages and events
**So that** the demo looks like a live, active workspace rather than an empty shell

## Acceptance Criteria

- [ ] **Given** the seeded database, **When** a demo case conversation is opened, **Then** at least 5 pre-existing messages are visible — a mix of system events (prerequisite activation, status changes) and manual HFA↔Developer messages
- [ ] **Given** the conversation thread, **When** it renders, **Then** messages span at least 2 different days and show realistic back-and-forth (e.g. HFA sends document request, Developer asks a question, HFA replies)
- [ ] **Given** the activity feed for the HFA user, **When** it loads, **Then** at least 6 realistic activity events are shown across both demo cases — including milestone progressions, prerequisite status changes, and document submissions
- [ ] **Given** the seeded activity events, **When** displayed, **Then** events have realistic timestamps (spread over the past 1–2 weeks relative to demo date) and reference real case/milestone/prerequisite names from the seed data

## Technical Notes

- Insert `conversation_messages` rows in the seed script for each demo case — mix `type: 'system'` and `type: 'manual'`
- Use realistic author names matching the seeded `profiles` rows (e.g. "Sarah Mitchell — HFA Staff", "Carlos Rivera — Developer")
- Insert `activity_events` rows covering: milestone activated, prerequisite triggered, document submitted, prerequisite accepted
- Timestamps: use relative offsets from a fixed anchor date (e.g. NOW() - interval '10 days') so data ages naturally

## Dependencies

### Requires
- `006-demo-data-cleanup` (realistic cases must exist first)

### Enables
- `007-conversation-thread/001-thread-rendering`
- `010-activity-feed/001-activity-feed-screen`

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Seed run multiple times | Idempotent — existing seeded messages deleted and re-inserted by anchor ID |
| Demo cases not yet created | Seed script creates cases before inserting messages |

## Out of Scope

- Real-time message generation (static seed data only)
- Generating activity events dynamically from actual status transitions (those are runtime events)
