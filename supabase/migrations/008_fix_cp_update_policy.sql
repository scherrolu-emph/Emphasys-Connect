-- Fix cp_update_accept_invite: replace auth.users subquery with auth.email()
-- The subquery required SELECT on auth.users which authenticated role lacks.

DROP POLICY IF EXISTS "cp_update_accept_invite" ON public.case_participants;

CREATE POLICY "cp_update_accept_invite" ON public.case_participants
  FOR UPDATE
  USING (
    email = auth.email()
  )
  WITH CHECK (
    email         = auth.email()
    AND invite_status = 'accepted'
    AND user_id       = auth.uid()
  );
