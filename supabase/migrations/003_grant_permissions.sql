-- ============================================================
-- Bolt 004 fix — Grant table-level privileges to Supabase roles
-- RLS policies filter rows, but PostgreSQL requires the role to
-- have table-level privileges before RLS is even evaluated.
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases                 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prerequisites         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_participants     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications         TO authenticated;

-- service_role bypasses RLS and needs full access for Edge Functions / admin ops
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles              TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases                 TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones            TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prerequisites         TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_participants     TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications         TO service_role;
