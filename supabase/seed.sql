-- ============================================================
-- Emphasys Connect — Demo Seed Data (Bolt 001 / Story 003)
-- ============================================================
-- Source: client/src/assets/mock/import-cases-mock.json
-- Project: Riverside Commons (HC-2024-001)
--
-- Run once in the Supabase SQL Editor.
-- Requires: staff@hfa.demo and developer@demo.com exist in auth.users.
-- Safe to re-run: all inserts use ON CONFLICT (id) DO NOTHING / DO UPDATE.
-- ============================================================

DO $$
DECLARE
  -- Org / case
  v_hfa_id  UUID := '00000000-0000-0000-0000-000000000001';
  v_case_id UUID := '00000000-0000-0000-0000-000000000010';

  -- Milestones (5 stages from mock)
  v_m1_id   UUID := '00000000-0000-0000-0000-000000001001'; -- Pre-Construction   (completed)
  v_m2_id   UUID := '00000000-0000-0000-0000-000000001002'; -- Foundation & Site Work (active)
  v_m3_id   UUID := '00000000-0000-0000-0000-000000001003'; -- Framing & Structure    (open)
  v_m4_id   UUID := '00000000-0000-0000-0000-000000001004'; -- MEP                    (open)
  v_m5_id   UUID := '00000000-0000-0000-0000-000000001005'; -- Certificate of Occupancy (open)

  -- Prerequisites — M1 (Pre-Construction, all accepted)
  v_p01_id  UUID := '00000000-0000-0000-0000-000000002001';
  v_p02_id  UUID := '00000000-0000-0000-0000-000000002002';
  v_p03_id  UUID := '00000000-0000-0000-0000-000000002003';
  v_p04_id  UUID := '00000000-0000-0000-0000-000000002004';

  -- Prerequisites — M2 (Foundation & Site Work, active — 1 received_processing)
  v_p05_id  UUID := '00000000-0000-0000-0000-000000002005';
  v_p06_id  UUID := '00000000-0000-0000-0000-000000002006';
  v_p07_id  UUID := '00000000-0000-0000-0000-000000002007';

  -- Prerequisites — M3 (Framing & Structure)
  v_p08_id  UUID := '00000000-0000-0000-0000-000000002008';
  v_p09_id  UUID := '00000000-0000-0000-0000-000000002009';

  -- Prerequisites — M4 (MEP)
  v_p10_id  UUID := '00000000-0000-0000-0000-000000002010';
  v_p11_id  UUID := '00000000-0000-0000-0000-000000002011';
  v_p12_id  UUID := '00000000-0000-0000-0000-000000002012';

  -- Prerequisites — M5 (Certificate of Occupancy)
  v_p13_id  UUID := '00000000-0000-0000-0000-000000002013';
  v_p14_id  UUID := '00000000-0000-0000-0000-000000002014';
  v_p15_id  UUID := '00000000-0000-0000-0000-000000002015';

  -- Participants
  v_cp1_id  UUID := '00000000-0000-0000-0000-000000003001';
  v_cp2_id  UUID := '00000000-0000-0000-0000-000000003002';

  -- Conversation seed message
  v_msg1_id UUID := '00000000-0000-0000-0000-000000004001';

  v_hfa_user_id UUID;
  v_dev_user_id UUID;
BEGIN
  -- ── Resolve demo user IDs ──────────────────────────────────
  SELECT id INTO v_hfa_user_id FROM auth.users WHERE email = 'staff@hfa.demo' LIMIT 1;
  SELECT id INTO v_dev_user_id FROM auth.users WHERE email = 'developer@demo.com' LIMIT 1;

  IF v_hfa_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo HFA user (staff@hfa.demo) not found. Create it in Supabase Auth first.';
  END IF;
  IF v_dev_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo developer user (developer@demo.com) not found. Create it in Supabase Auth first.';
  END IF;

  -- ── Profiles ───────────────────────────────────────────────
  INSERT INTO public.profiles (id, hfa_id, email, display_name, is_hfa)
  VALUES
    (v_hfa_user_id, v_hfa_id, 'staff@hfa.demo',    'James Whitfield', true),
    (v_dev_user_id, v_hfa_id, 'developer@demo.com', 'Maria Torres',    false)
  ON CONFLICT (id) DO UPDATE SET
    hfa_id       = EXCLUDED.hfa_id,
    display_name = EXCLUDED.display_name,
    is_hfa       = EXCLUDED.is_hfa;

  -- ── Case — Riverside Commons ───────────────────────────────
  INSERT INTO public.cases
    (id, hfa_id, title, reference_number, case_type, imc_project_id, created_by)
  VALUES (
    v_case_id, v_hfa_id,
    'Riverside Commons',
    'HC-2024-001',
    'development_construction',
    'HC-2024-001',
    v_hfa_user_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── Milestones ─────────────────────────────────────────────
  INSERT INTO public.milestones (id, hfa_id, case_id, title, order_index, status)
  VALUES
    (v_m1_id, v_hfa_id, v_case_id, 'Pre-Construction',            1, 'completed'),
    (v_m2_id, v_hfa_id, v_case_id, 'Foundation & Site Work',      2, 'active'),
    (v_m3_id, v_hfa_id, v_case_id, 'Framing & Structure',         3, 'open'),
    (v_m4_id, v_hfa_id, v_case_id, 'Mechanical, Electrical & Plumbing', 4, 'open'),
    (v_m5_id, v_hfa_id, v_case_id, 'Certificate of Occupancy',   5, 'open')
  ON CONFLICT (id) DO NOTHING;

  -- ── Prerequisites ──────────────────────────────────────────

  -- M1: Pre-Construction (all accepted)
  INSERT INTO public.prerequisites
    (id, hfa_id, case_id, milestone_id, title, type, status, requested)
  VALUES
    (v_p01_id, v_hfa_id, v_case_id, v_m1_id,
     'Building Permit',                   'document_submission', 'accepted', true),
    (v_p02_id, v_hfa_id, v_case_id, v_m1_id,
     'Environmental Clearance Letter',    'document_submission', 'accepted', true),
    (v_p03_id, v_hfa_id, v_case_id, v_m1_id,
     'Architect Certification of Plans',  'acceptance_comment',  'accepted', true),
    (v_p04_id, v_hfa_id, v_case_id, v_m1_id,
     'Site Control Evidence',             'document_submission', 'accepted', true)
  ON CONFLICT (id) DO NOTHING;

  -- M2: Foundation & Site Work (active — demo hero state)
  INSERT INTO public.prerequisites
    (id, hfa_id, case_id, milestone_id, title, type, status, requested)
  VALUES
    (v_p05_id, v_hfa_id, v_case_id, v_m2_id,
     'Foundation Inspection Report',      'document_submission', 'received_processing', true),
    (v_p06_id, v_hfa_id, v_case_id, v_m2_id,
     'Geo-Technical Report',              'document_submission', 'pending_open',        false),
    (v_p07_id, v_hfa_id, v_case_id, v_m2_id,
     'Engineer Certification of Foundation', 'acceptance_comment', 'pending_open',     false)
  ON CONFLICT (id) DO NOTHING;

  -- M3: Framing & Structure
  INSERT INTO public.prerequisites
    (id, hfa_id, case_id, milestone_id, title, type, status, requested)
  VALUES
    (v_p08_id, v_hfa_id, v_case_id, v_m3_id,
     'Framing Inspection Report',         'document_submission', 'pending_open', false),
    (v_p09_id, v_hfa_id, v_case_id, v_m3_id,
     'Structural Engineer Sign-Off',      'acceptance_comment',  'pending_open', false)
  ON CONFLICT (id) DO NOTHING;

  -- M4: Mechanical, Electrical & Plumbing
  INSERT INTO public.prerequisites
    (id, hfa_id, case_id, milestone_id, title, type, status, requested)
  VALUES
    (v_p10_id, v_hfa_id, v_case_id, v_m4_id,
     'MEP Rough-In Inspection Report',    'document_submission', 'pending_open', false),
    (v_p11_id, v_hfa_id, v_case_id, v_m4_id,
     'Energy Code Compliance Certificate','document_submission', 'pending_open', false),
    (v_p12_id, v_hfa_id, v_case_id, v_m4_id,
     'MEP Engineer Certification',        'acceptance_comment',  'pending_open', false)
  ON CONFLICT (id) DO NOTHING;

  -- M5: Certificate of Occupancy
  INSERT INTO public.prerequisites
    (id, hfa_id, case_id, milestone_id, title, type, status, requested)
  VALUES
    (v_p13_id, v_hfa_id, v_case_id, v_m5_id,
     'Certificate of Occupancy',          'document_submission', 'pending_open', false),
    (v_p14_id, v_hfa_id, v_case_id, v_m5_id,
     'Final Cost Certification',          'document_submission', 'pending_open', false),
    (v_p15_id, v_hfa_id, v_case_id, v_m5_id,
     'HFA Final Inspection Sign-Off',     'acceptance_comment',  'pending_open', false)
  ON CONFLICT (id) DO NOTHING;

  -- ── Case participants ──────────────────────────────────────
  INSERT INTO public.case_participants
    (id, hfa_id, case_id, user_id, email, role, invite_status, source)
  VALUES
    (v_cp1_id, v_hfa_id, v_case_id, v_hfa_user_id,
     'staff@hfa.demo',    'hfa_staff', 'accepted', 'creator'),
    (v_cp2_id, v_hfa_id, v_case_id, v_dev_user_id,
     'developer@demo.com', 'developer', 'accepted', 'imc')
  ON CONFLICT (id) DO NOTHING;

  -- ── Seed conversation message ──────────────────────────────
  INSERT INTO public.conversation_messages
    (id, hfa_id, case_id, author_id, type, content)
  VALUES (
    v_msg1_id, v_hfa_id, v_case_id,
    NULL,
    'system',
    'Case imported from IMC (HC-2024-001). Foundation & Site Work milestone is now active — Foundation Inspection Report is under review.'
  )
  ON CONFLICT (id) DO NOTHING;

END $$;
