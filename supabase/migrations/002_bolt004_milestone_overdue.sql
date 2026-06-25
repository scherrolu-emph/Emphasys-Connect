-- ============================================================
-- Bolt 004 — Add overdue tracking fields to milestones +
--            HFA-staff case visibility policy
-- ============================================================

-- ── Milestone overdue fields ──────────────────────────────

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS target_days  INTEGER,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- ── HFA-staff can see all cases for their org ─────────────
-- The initial "cases_select" policy only allows participants.
-- HFA staff need a full org-level read so the dashboard works
-- without requiring the staff user to be a participant on every case.

CREATE POLICY "cases_select_hfa_staff" ON public.cases
  FOR SELECT USING (
    hfa_id = (
      SELECT hfa_id
      FROM public.profiles
      WHERE id = auth.uid()
        AND is_hfa = true
        AND hfa_id IS NOT NULL
    )
  );

-- ── Milestones: HFA staff can update activated_at / target_days ─
-- The existing milestones_update policy already covers this via
-- the case_participants + is_hfa check, so no new policy is needed.

-- ── Index: support activated_at lookups ───────────────────

CREATE INDEX IF NOT EXISTS idx_milestones_activated_at
  ON public.milestones (activated_at)
  WHERE activated_at IS NOT NULL;
