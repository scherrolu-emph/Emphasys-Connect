-- ============================================================
-- Bolt 004 fix — Eliminate infinite recursion in RLS policies
--
-- Root cause: cp_select on case_participants references case_participants
-- in a subquery. Every other policy that checks participation queries
-- case_participants, which re-triggers cp_select → infinite loop.
--
-- Fix: a SECURITY DEFINER helper function that runs as the owner
-- (bypassing RLS) so participation checks don't re-enter the policies.
-- All policies that previously used inline EXISTS (...case_participants...)
-- are dropped and recreated to call this function instead.
-- ============================================================

-- ── Helper: participation check (bypasses RLS) ────────────────

CREATE OR REPLACE FUNCTION public.is_case_participant(p_case_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.case_participants
    WHERE case_id = p_case_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_hfa_case_participant(p_case_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.case_participants cp
    JOIN public.profiles p ON p.id = cp.user_id
    WHERE cp.case_id = p_case_id AND cp.user_id = auth.uid() AND p.is_hfa = true
  );
$$;

-- ── case_participants ─────────────────────────────────────────

DROP POLICY IF EXISTS "cp_select" ON public.case_participants;
DROP POLICY IF EXISTS "cp_insert" ON public.case_participants;
DROP POLICY IF EXISTS "cp_delete" ON public.case_participants;

-- See own row, or any row on a case you participate in
CREATE POLICY "cp_select" ON public.case_participants
  FOR SELECT USING (
    user_id = auth.uid() OR is_case_participant(case_id)
  );

-- HFA participant on the case can add new participants
CREATE POLICY "cp_insert" ON public.case_participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hfa = true)
    AND (
      EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_participants.case_id AND c.created_by = auth.uid())
      OR is_case_participant(case_participants.case_id)
    )
  );

CREATE POLICY "cp_delete" ON public.case_participants
  FOR DELETE USING (is_hfa_case_participant(case_id));

-- ── cases ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "cases_select" ON public.cases;

CREATE POLICY "cases_select" ON public.cases
  FOR SELECT USING (is_case_participant(id));

-- ── milestones ────────────────────────────────────────────────

DROP POLICY IF EXISTS "milestones_select"  ON public.milestones;
DROP POLICY IF EXISTS "milestones_insert"  ON public.milestones;
DROP POLICY IF EXISTS "milestones_update"  ON public.milestones;

CREATE POLICY "milestones_select" ON public.milestones
  FOR SELECT USING (is_case_participant(case_id));

CREATE POLICY "milestones_insert" ON public.milestones
  FOR INSERT WITH CHECK (is_hfa_case_participant(case_id));

CREATE POLICY "milestones_update" ON public.milestones
  FOR UPDATE USING (is_hfa_case_participant(case_id));

-- ── prerequisites ─────────────────────────────────────────────

DROP POLICY IF EXISTS "prerequisites_select" ON public.prerequisites;
DROP POLICY IF EXISTS "prerequisites_insert" ON public.prerequisites;
DROP POLICY IF EXISTS "prerequisites_update" ON public.prerequisites;

CREATE POLICY "prerequisites_select" ON public.prerequisites
  FOR SELECT USING (is_case_participant(case_id));

CREATE POLICY "prerequisites_insert" ON public.prerequisites
  FOR INSERT WITH CHECK (is_hfa_case_participant(case_id));

CREATE POLICY "prerequisites_update" ON public.prerequisites
  FOR UPDATE USING (is_hfa_case_participant(case_id));

-- ── conversation_messages ─────────────────────────────────────

DROP POLICY IF EXISTS "msgs_select" ON public.conversation_messages;
DROP POLICY IF EXISTS "msgs_insert" ON public.conversation_messages;

CREATE POLICY "msgs_select" ON public.conversation_messages
  FOR SELECT USING (is_case_participant(case_id));

CREATE POLICY "msgs_insert" ON public.conversation_messages
  FOR INSERT WITH CHECK (
    is_case_participant(case_id)
    AND (author_id = auth.uid() OR author_id IS NULL)
  );

-- ── cases_update ──────────────────────────────────────────────

DROP POLICY IF EXISTS "cases_update" ON public.cases;

CREATE POLICY "cases_update" ON public.cases
  FOR UPDATE USING (is_hfa_case_participant(id));
