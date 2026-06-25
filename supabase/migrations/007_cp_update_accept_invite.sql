-- Allow a participant to accept their own invite.
-- Matched by email (user_id is null for external invitees at invite time).
-- WITH CHECK restricts writes to invite_status='accepted' and user_id=auth.uid() only.

CREATE POLICY "cp_update_accept_invite" ON public.case_participants
  FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    email    = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND invite_status = 'accepted'
    AND user_id       = auth.uid()
  );
