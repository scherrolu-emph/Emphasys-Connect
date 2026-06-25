---
stage: implement
bolt: "015"
created: 2026-06-25T13:00:00Z
---

## Implementation Walkthrough: Demo Data Refresh (Bolt 015)

### File Modified

`supabase/seed.sql` — full rewrite (single file change, no schema migration).

---

### What Changed

#### 1. Fixed 5 `acceptance_comment` Prerequisites → `document_submission`

Existing rows updated via `ON CONFLICT (id) DO UPDATE SET type = 'document_submission'`:

| UUID suffix | Prereq title | Milestone |
|-------------|-------------|-----------|
| …002003 | Architect Certification of Plans | M1 Pre-Construction |
| …002007 | Engineer Certification of Foundation | M2 Foundation |
| …002009 | Structural Engineer Sign-Off | M3 Framing |
| …002012 | MEP Engineer Certification | M4 MEP |
| …002015 | HFA Final Inspection Sign-Off | M5 Certificate of Occupancy |

All other existing prereqs (p01, p02, p04, p05, p06, p08, p10, p11, p13, p14) were already `document_submission` — their `ON CONFLICT DO UPDATE SET type` is a no-op.

#### 2. Added Conversation Thread for Riverside Commons (7 messages)

Existing `v_msg1_id` content updated (via `DO UPDATE SET content, created_at`) to serve as the first system message at `NOW() - 14 days`. Six new messages added:

| UUID suffix | Type | Author | Days ago | Content summary |
|-------------|------|--------|----------|-----------------|
| …004001 | system | — | 14 | Case imported, Pre-Construction active |
| …004002 | system | — | 10 | Pre-Construction completed, Foundation active |
| …004003 | message | HFA | 9 | Request Foundation + Geo-Technical Reports |
| …004004 | message | Dev | 8 | Confirms inspection scheduled, will upload |
| …004005 | message | HFA | 7 | Hold Geo-Technical until Foundation clears |
| …004006 | system | — | 6 | Foundation Inspection Report received |
| …004007 | message | HFA | 5 | Under review, decision in 3 business days |

#### 3. Added Oakview Senior Living Case

- **Case**: HC-2025-002, UUID `…000000020`, `development_construction`
- **Milestones**: 3 (Site Preparation=completed, Structural Work=active, Interior Fit-Out=open)
- **Prerequisites**: 8 total, all `document_submission`
  - M6 (3 prereqs, all `accepted`): Site Survey Report, Environmental Site Assessment, Grading and Drainage Permit
  - M7 (3 prereqs, all `pending_open`): Structural Inspection Report, Foundation Waterproofing Certificate, Steel Certification
  - M8 (2 prereqs, all `pending_open`): Interior Framing Inspection, Insulation Certificate
- **Participants**: same 2 demo users (cp3, cp4), both `accepted`

#### 4. Added Conversation Thread for Oakview Senior Living (5 messages)

All new rows via `ON CONFLICT (id) DO NOTHING`:

| UUID suffix | Type | Author | Days ago | Content summary |
|-------------|------|--------|----------|-----------------|
| …004008 | system | — | 5 | Case imported, Site Preparation active |
| …004009 | system | — | 3 | Site Preparation completed, Structural active |
| …004010 | message | HFA | 3 (+4h) | Structural phase open, prepare Structural Report |
| …004011 | message | Dev | 2 | Inspection next week, will upload immediately |
| …004012 | message | HFA | 1 | Also need Waterproofing Cert + Steel Certification |

---

### Idempotency Guarantees

- All existing rows: `ON CONFLICT (id) DO NOTHING` (cases, milestones, new prereqs, participants, Oakview messages)
- Prereq type fixes: `ON CONFLICT (id) DO UPDATE SET type = 'document_submission'`
- Riverside conversation messages: `ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, created_at = EXCLUDED.created_at` (ensures msg1 gets new content + timestamp on re-run)
- Script is safe to run multiple times on a live database

---

### UUID Registry

| Variable | UUID | Description |
|----------|------|-------------|
| v_case2_id | …000000020 | Oakview Senior Living |
| v_m6_id | …001006 | Oakview: Site Preparation |
| v_m7_id | …001007 | Oakview: Structural Work |
| v_m8_id | …001008 | Oakview: Interior Fit-Out |
| v_p16–p18 | …002016–018 | Oakview M6 prereqs |
| v_p19–p21 | …002019–021 | Oakview M7 prereqs |
| v_p22–p23 | …002022–023 | Oakview M8 prereqs |
| v_cp3_id | …003003 | Oakview HFA participant |
| v_cp4_id | …003004 | Oakview Dev participant |
| v_msg1_id | …004001 | Riverside: updated system msg |
| v_msg2–7 | …004002–007 | Riverside: 6 new messages |
| v_msg8–12 | …004008–012 | Oakview: 5 messages |
