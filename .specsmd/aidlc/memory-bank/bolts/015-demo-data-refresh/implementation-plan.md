---
stage: plan
bolt: "015"
created: 2026-06-25T12:00:00Z
---

## Implementation Plan: Demo Data Refresh (Bolt 015)

### Objective

Update `supabase/seed.sql` to: (1) fix all `acceptance_comment` prerequisites to `document_submission`, (2) add a second realistic demo case, (3) pre-load both cases' conversation threads with realistic messages spanning multiple days, which also populates the HFA activity feed.

---

### Current State (from seed.sql audit)

- **1 case**: "Riverside Commons" (HC-2024-001) — no "Test" cases present ✅
- **acceptance_comment prereqs to fix**: p03 (M1), p07 (M2), p09 (M3), p12 (M4), p15 (M5) — 5 rows
- **Conversation messages**: only 1 system message seeded — needs 5+ per case
- **Activity feed**: reads from `conversation_messages` directly (no separate table) — more messages = richer activity

---

### Deliverables

1. **Fix existing prereq types**: Change 5 `acceptance_comment` rows to `document_submission` in `supabase/seed.sql` — use `ON CONFLICT (id) DO UPDATE SET type = 'document_submission'`
2. **Add second demo case** "Oakview Senior Living" (HC-2025-002, `development_construction`) with:
   - 3 milestones: "Site Preparation" (completed), "Structural Work" (active), "Interior Fit-Out" (open)
   - All prerequisites: `document_submission` type
   - Participants: same `staff@hfa.demo` (HFA) + `developer@demo.com` (Developer)
3. **Add conversation messages for Riverside Commons**: 6 messages — 2 system events + 4 manual HFA↔Developer back-and-forth spanning ~10 days
4. **Add conversation messages for Oakview Senior Living**: 5 messages — 2 system events + 3 manual messages spanning ~5 days
5. **Idempotency**: all new INSERTs use `ON CONFLICT (id) DO NOTHING`; existing prereq-type fixes use `DO UPDATE`

---

### Dependencies

- `supabase/seed.sql` — only file modified
- No schema migration needed — `document_submission` already valid enum value
- Demo user accounts (`staff@hfa.demo`, `developer@demo.com`) must exist in `auth.users` (already required by existing seed)

---

### Technical Approach

**Single file change**: `supabase/seed.sql` only. Structure additions:

```
New UUIDs needed:
- v_case2_id     (second case)
- v_m6_id–v_m8_id (3 milestones for Oakview)
- v_p16_id–v_p23_id (8 prereqs across 3 milestones)
- v_cp3_id, v_cp4_id (participants for second case)
- v_msg2_id–v_msg12_id (11 new conversation messages across both cases)
```

**Message content for Riverside Commons** (6 messages, oldest→newest, M2 active):
- `system`: "Pre-Construction milestone completed. Foundation & Site Work is now active." (12 days ago)
- `manual` (HFA→Dev): "Hi Maria, Foundation Inspection Report has been submitted — we're reviewing it now." (10 days ago)
- `manual` (Dev→HFA): "Thanks James. Should we hold off on the Geo-Technical Report until you've cleared the Foundation one?" (9 days ago)
- `manual` (HFA→Dev): "Yes, let's wait. I'll give you a green light by end of week." (9 days ago)
- `system`: "Foundation Inspection Report is under review (received_processing)." (8 days ago)
- `manual` (HFA→Dev): "Report is under review with our engineer. Expect feedback within 3 business days." (7 days ago)

**Message content for Oakview Senior Living** (5 messages):
- `system`: "Case imported from IMC (HC-2025-002). Site Preparation is now active." (5 days ago)
- `system`: "Site Preparation milestone completed. Structural Work is now active." (3 days ago)
- `manual` (HFA→Dev): "Oakview structural phase has kicked off. Please start preparing the Structural Inspection Report." (3 days ago)
- `manual` (Dev→HFA): "Understood. We expect the inspection to happen next week." (2 days ago)
- `manual` (HFA→Dev): "Sounds good — please upload as soon as it's signed off." (1 day ago)

**Timestamp approach**: Use `NOW() - INTERVAL 'N days'` to keep messages naturally aged.

---

### Acceptance Criteria

- [ ] Seed runs idempotently on the hosted Supabase instance (SQL Editor)
- [ ] No cases with "Test" in name (already satisfied — checking remains)
- [ ] "Riverside Commons" has 0 `acceptance_comment` prerequisites
- [ ] "Oakview Senior Living" exists with 3 milestones, all prereqs `document_submission`
- [ ] Riverside Commons conversation thread shows ≥6 messages (mix of system + manual)
- [ ] Oakview conversation thread shows ≥5 messages
- [ ] HFA activity feed shows events from both cases (≥10 messages total across both)
- [ ] All new rows have correct `hfa_id = '00000000-0000-0000-0000-000000000001'`
