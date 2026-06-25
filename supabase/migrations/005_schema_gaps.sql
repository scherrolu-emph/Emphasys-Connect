-- ============================================================
-- Emphasys Connect — Schema Gaps (pre-bolts 005–010)
-- Additive only: no renames, no drops, no breaking changes
-- ============================================================

-- ── prerequisites: audit trail + return notes ────────────

ALTER TABLE public.prerequisites
  ADD COLUMN IF NOT EXISTS notes        TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at  TIMESTAMPTZ;

-- ── milestones: completion timestamp ─────────────────────

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ── conversation_messages: structured system event data ──

ALTER TABLE public.conversation_messages
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ── notifications: display fields + prereq link ──────────
-- DEFAULT '' on title/body handles any pre-existing rows;
-- application code always provides values on insert.
-- read_at (timestamp) is used by Bolt 010; existing boolean
-- `read` column is kept — set true when read_at is written.

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS title     TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS body      TEXT        NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS prereq_id UUID        REFERENCES public.prerequisites(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS read_at   TIMESTAMPTZ;

-- ── indexes ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_prereqs_owner_id
  ON public.prerequisites (owner_id)
  WHERE owner_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifs_prereq_id
  ON public.notifications (prereq_id)
  WHERE prereq_id IS NOT NULL;

-- Partial index on unread notifications (most common query path)
CREATE INDEX IF NOT EXISTS idx_notifs_unread
  ON public.notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;
