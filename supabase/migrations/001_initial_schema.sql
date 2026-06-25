-- ============================================================
-- Emphasys Connect — Initial Schema (Bolt 001)
-- ============================================================

-- ── Enums ─────────────────────────────────────────────────

CREATE TYPE public.case_type AS ENUM (
  'blank',
  'development_construction',
  'loan_underwriting',
  'bond_issuance'
);

CREATE TYPE public.milestone_status AS ENUM ('open', 'active', 'completed');

CREATE TYPE public.prerequisite_type AS ENUM ('document_submission', 'acceptance_comment');

CREATE TYPE public.prerequisite_status AS ENUM (
  'pending_open',
  'received_processing',
  'accepted'
);

CREATE TYPE public.participant_role AS ENUM ('hfa_staff', 'developer');

CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted');

CREATE TYPE public.participant_source AS ENUM ('imc', 'manual', 'creator');

CREATE TYPE public.message_type AS ENUM ('system', 'message');

CREATE TYPE public.notification_type AS ENUM ('mention', 'tagged', 'assigned');

-- ── Tables ────────────────────────────────────────────────

-- profiles: one row per auth user, created automatically via trigger
CREATE TABLE public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hfa_id        UUID,
  email         TEXT        NOT NULL,
  display_name  TEXT        NOT NULL,
  is_hfa        BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- cases
CREATE TABLE public.cases (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hfa_id           UUID        NOT NULL,
  title            TEXT        NOT NULL,
  reference_number TEXT,
  case_type        public.case_type NOT NULL DEFAULT 'blank',
  imc_project_id   TEXT,
  created_by       UUID        REFERENCES public.profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- milestones
CREATE TABLE public.milestones (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hfa_id      UUID        NOT NULL,
  case_id     UUID        NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  order_index INTEGER     NOT NULL,
  status      public.milestone_status NOT NULL DEFAULT 'open',
  is_internal BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- prerequisites
CREATE TABLE public.prerequisites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hfa_id       UUID        NOT NULL,
  case_id      UUID        NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  milestone_id UUID        NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  type         public.prerequisite_type   NOT NULL,
  status       public.prerequisite_status NOT NULL DEFAULT 'pending_open',
  requested    BOOLEAN     NOT NULL DEFAULT false,
  returned     BOOLEAN     NOT NULL DEFAULT false,
  owner_id     UUID        REFERENCES public.profiles(id),
  upload_link  TEXT,
  doc_name     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- case_participants
CREATE TABLE public.case_participants (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hfa_id        UUID        NOT NULL,
  case_id       UUID        NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id       UUID        REFERENCES public.profiles(id),
  email         TEXT        NOT NULL,
  role          public.participant_role   NOT NULL,
  invite_status public.invite_status      NOT NULL DEFAULT 'pending',
  source        public.participant_source NOT NULL DEFAULT 'manual',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- conversation_messages
CREATE TABLE public.conversation_messages (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hfa_id    UUID        NOT NULL,
  case_id   UUID        NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  author_id UUID        REFERENCES public.profiles(id),
  type      public.message_type NOT NULL DEFAULT 'message',
  content   TEXT        NOT NULL,
  mentions  UUID[]      NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notifications
CREATE TABLE public.notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hfa_id     UUID        NOT NULL,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id    UUID        REFERENCES public.cases(id) ON DELETE CASCADE,
  type       public.notification_type NOT NULL,
  message_id UUID        REFERENCES public.conversation_messages(id) ON DELETE CASCADE,
  read       BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────

CREATE INDEX idx_cases_hfa_id            ON public.cases(hfa_id);
CREATE INDEX idx_cases_created_by        ON public.cases(created_by);
CREATE INDEX idx_milestones_case_id      ON public.milestones(case_id);
CREATE INDEX idx_prereqs_case_id         ON public.prerequisites(case_id);
CREATE INDEX idx_prereqs_milestone_id    ON public.prerequisites(milestone_id);
CREATE INDEX idx_cp_case_id              ON public.case_participants(case_id);
CREATE INDEX idx_cp_user_id              ON public.case_participants(user_id);
CREATE INDEX idx_cp_email                ON public.case_participants(email);
CREATE INDEX idx_msgs_case_id            ON public.conversation_messages(case_id);
CREATE INDEX idx_msgs_created_at         ON public.conversation_messages(created_at);
CREATE INDEX idx_notifs_user_id          ON public.notifications(user_id);
CREATE INDEX idx_notifs_case_id          ON public.notifications(case_id);

-- ── Trigger: auto-create profile on signup ─────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, is_hfa)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'is_hfa')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row-Level Security ────────────────────────────────────

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prerequisites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_participants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- cases: readable by participants
CREATE POLICY "cases_select" ON public.cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      WHERE cp.case_id = cases.id AND cp.user_id = auth.uid()
    )
  );

-- cases: HFA can create
CREATE POLICY "cases_insert" ON public.cases
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hfa = true)
  );

-- cases: HFA participants can update
CREATE POLICY "cases_update" ON public.cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      JOIN public.profiles p ON p.id = cp.user_id
      WHERE cp.case_id = cases.id AND cp.user_id = auth.uid() AND p.is_hfa = true
    )
  );

-- milestones: readable by case participants
CREATE POLICY "milestones_select" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      WHERE cp.case_id = milestones.case_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_insert" ON public.milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      JOIN public.profiles p ON p.id = cp.user_id
      WHERE cp.case_id = milestones.case_id AND cp.user_id = auth.uid() AND p.is_hfa = true
    )
  );

CREATE POLICY "milestones_update" ON public.milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      JOIN public.profiles p ON p.id = cp.user_id
      WHERE cp.case_id = milestones.case_id AND cp.user_id = auth.uid() AND p.is_hfa = true
    )
  );

-- prerequisites: readable by case participants
CREATE POLICY "prerequisites_select" ON public.prerequisites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      WHERE cp.case_id = prerequisites.case_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "prerequisites_insert" ON public.prerequisites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      JOIN public.profiles p ON p.id = cp.user_id
      WHERE cp.case_id = prerequisites.case_id AND cp.user_id = auth.uid() AND p.is_hfa = true
    )
  );

CREATE POLICY "prerequisites_update" ON public.prerequisites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      JOIN public.profiles p ON p.id = cp.user_id
      WHERE cp.case_id = prerequisites.case_id AND cp.user_id = auth.uid() AND p.is_hfa = true
    )
  );

-- case_participants: readable by fellow participants
CREATE POLICY "cp_select" ON public.case_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.case_participants cp2
      WHERE cp2.case_id = case_participants.case_id AND cp2.user_id = auth.uid()
    )
  );

-- case_participants: HFA can add; also allows the first insert (creator adding themselves via created_by)
CREATE POLICY "cp_insert" ON public.case_participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hfa = true)
    AND (
      EXISTS (
        SELECT 1 FROM public.cases c
        WHERE c.id = case_participants.case_id AND c.created_by = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.case_participants cp
        WHERE cp.case_id = case_participants.case_id AND cp.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "cp_delete" ON public.case_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      JOIN public.profiles p ON p.id = cp.user_id
      WHERE cp.case_id = case_participants.case_id AND cp.user_id = auth.uid() AND p.is_hfa = true
    )
  );

-- conversation_messages: readable + writable by case participants
CREATE POLICY "msgs_select" ON public.conversation_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      WHERE cp.case_id = conversation_messages.case_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "msgs_insert" ON public.conversation_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.case_participants cp
      WHERE cp.case_id = conversation_messages.case_id AND cp.user_id = auth.uid()
    )
    AND (author_id = auth.uid() OR author_id IS NULL)
  );

-- notifications: own only
CREATE POLICY "notifs_select" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifs_insert" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "notifs_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ── Realtime ──────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prerequisites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
