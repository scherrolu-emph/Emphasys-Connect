-- ============================================================
-- Allow developers to mark prerequisites as ready for review
-- ============================================================

DROP POLICY IF EXISTS "prerequisites_update" ON public.prerequisites;

CREATE POLICY "prerequisites_update" ON public.prerequisites
  FOR UPDATE
  USING (
    is_hfa_case_participant(case_id)
    OR is_case_participant(case_id)
  )
  WITH CHECK (
    is_hfa_case_participant(case_id)
    OR (
      is_case_participant(case_id)
      AND status = 'received_processing'
    )
  );
