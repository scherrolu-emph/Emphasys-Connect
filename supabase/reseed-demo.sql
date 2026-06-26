-- ============================================================
-- Emphasys Connect — Demo Reseed (staff@hfa.com)
-- Clears and reseeds both demo cases for the staff@hfa.com user.
-- Run in the Supabase SQL Editor.
-- Requires: staff@hfa.com and developer@demo.com exist in auth.users.
-- ============================================================

DO $$
DECLARE
  v_hfa_id    UUID := '00000000-0000-0000-0000-000000000001';
  v_case_id   UUID := '00000000-0000-0000-0000-000000000010';
  v_case2_id  UUID := '00000000-0000-0000-0000-000000000020';
  v_m1_id     UUID := '00000000-0000-0000-0000-000000001001';
  v_m2_id     UUID := '00000000-0000-0000-0000-000000001002';
  v_m3_id     UUID := '00000000-0000-0000-0000-000000001003';
  v_m4_id     UUID := '00000000-0000-0000-0000-000000001004';
  v_m5_id     UUID := '00000000-0000-0000-0000-000000001005';
  v_m6_id     UUID := '00000000-0000-0000-0000-000000001006';
  v_m7_id     UUID := '00000000-0000-0000-0000-000000001007';
  v_m8_id     UUID := '00000000-0000-0000-0000-000000001008';
  v_p01_id    UUID := '00000000-0000-0000-0000-000000002001';
  v_p02_id    UUID := '00000000-0000-0000-0000-000000002002';
  v_p03_id    UUID := '00000000-0000-0000-0000-000000002003';
  v_p04_id    UUID := '00000000-0000-0000-0000-000000002004';
  v_p05_id    UUID := '00000000-0000-0000-0000-000000002005';
  v_p06_id    UUID := '00000000-0000-0000-0000-000000002006';
  v_p07_id    UUID := '00000000-0000-0000-0000-000000002007';
  v_p08_id    UUID := '00000000-0000-0000-0000-000000002008';
  v_p09_id    UUID := '00000000-0000-0000-0000-000000002009';
  v_p10_id    UUID := '00000000-0000-0000-0000-000000002010';
  v_p11_id    UUID := '00000000-0000-0000-0000-000000002011';
  v_p12_id    UUID := '00000000-0000-0000-0000-000000002012';
  v_p13_id    UUID := '00000000-0000-0000-0000-000000002013';
  v_p14_id    UUID := '00000000-0000-0000-0000-000000002014';
  v_p15_id    UUID := '00000000-0000-0000-0000-000000002015';
  v_p16_id    UUID := '00000000-0000-0000-0000-000000002016';
  v_p17_id    UUID := '00000000-0000-0000-0000-000000002017';
  v_p18_id    UUID := '00000000-0000-0000-0000-000000002018';
  v_p19_id    UUID := '00000000-0000-0000-0000-000000002019';
  v_p20_id    UUID := '00000000-0000-0000-0000-000000002020';
  v_p21_id    UUID := '00000000-0000-0000-0000-000000002021';
  v_p22_id    UUID := '00000000-0000-0000-0000-000000002022';
  v_p23_id    UUID := '00000000-0000-0000-0000-000000002023';
  v_cp1_id    UUID := '00000000-0000-0000-0000-000000003001';
  v_cp2_id    UUID := '00000000-0000-0000-0000-000000003002';
  v_cp3_id    UUID := '00000000-0000-0000-0000-000000003003';
  v_cp4_id    UUID := '00000000-0000-0000-0000-000000003004';
  v_msg1_id   UUID := '00000000-0000-0000-0000-000000004001';
  v_msg2_id   UUID := '00000000-0000-0000-0000-000000004002';
  v_msg3_id   UUID := '00000000-0000-0000-0000-000000004003';
  v_msg4_id   UUID := '00000000-0000-0000-0000-000000004004';
  v_msg5_id   UUID := '00000000-0000-0000-0000-000000004005';
  v_msg6_id   UUID := '00000000-0000-0000-0000-000000004006';
  v_msg7_id   UUID := '00000000-0000-0000-0000-000000004007';
  v_msg8_id   UUID := '00000000-0000-0000-0000-000000004008';
  v_msg9_id   UUID := '00000000-0000-0000-0000-000000004009';
  v_msg10_id  UUID := '00000000-0000-0000-0000-000000004010';
  v_msg11_id  UUID := '00000000-0000-0000-0000-000000004011';
  v_msg12_id  UUID := '00000000-0000-0000-0000-000000004012';
  v_hfa_user_id UUID;
  v_dev_user_id UUID;
BEGIN
  SELECT id INTO v_hfa_user_id FROM auth.users WHERE email = 'staff@hfa.com' LIMIT 1;
  SELECT id INTO v_dev_user_id FROM auth.users WHERE email = 'developer@demo.com' LIMIT 1;

  IF v_hfa_user_id IS NULL THEN
    RAISE EXCEPTION 'HFA user (staff@hfa.com) not found in auth.users.';
  END IF;
  IF v_dev_user_id IS NULL THEN
    RAISE EXCEPTION 'Developer user (developer@demo.com) not found in auth.users.';
  END IF;

  -- ── Clear existing demo data (FK-safe order) ─────────────────
  DELETE FROM public.conversation_messages WHERE case_id IN (v_case_id, v_case2_id);
  DELETE FROM public.case_participants     WHERE case_id IN (v_case_id, v_case2_id);
  DELETE FROM public.prerequisites         WHERE case_id IN (v_case_id, v_case2_id);
  DELETE FROM public.milestones            WHERE case_id IN (v_case_id, v_case2_id);
  DELETE FROM public.cases                 WHERE id      IN (v_case_id, v_case2_id);

  -- ── Profiles ─────────────────────────────────────────────────
  INSERT INTO public.profiles (id, hfa_id, email, display_name, is_hfa)
  VALUES
    (v_hfa_user_id, v_hfa_id, 'staff@hfa.com',      'James Whitfield', true),
    (v_dev_user_id, v_hfa_id, 'developer@demo.com',  'Maria Torres',    false)
  ON CONFLICT (id) DO UPDATE SET
    hfa_id       = EXCLUDED.hfa_id,
    email        = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    is_hfa       = EXCLUDED.is_hfa;

  -- ════════════════════════════════════════════════════════════════
  -- CASE 1: Riverside Commons
  -- ════════════════════════════════════════════════════════════════
  INSERT INTO public.cases (id, hfa_id, title, reference_number, case_type, imc_project_id, created_by)
  VALUES (v_case_id, v_hfa_id, 'Riverside Commons', 'HC-2024-001', 'development_construction', 'HC-2024-001', v_hfa_user_id);

  INSERT INTO public.milestones (id, hfa_id, case_id, title, order_index, status)
  VALUES
    (v_m1_id, v_hfa_id, v_case_id, 'Pre-Construction',                  1, 'completed'),
    (v_m2_id, v_hfa_id, v_case_id, 'Foundation & Site Work',            2, 'active'),
    (v_m3_id, v_hfa_id, v_case_id, 'Framing & Structure',               3, 'open'),
    (v_m4_id, v_hfa_id, v_case_id, 'Mechanical, Electrical & Plumbing', 4, 'open'),
    (v_m5_id, v_hfa_id, v_case_id, 'Certificate of Occupancy',          5, 'open');

  INSERT INTO public.prerequisites (id, hfa_id, case_id, milestone_id, title, type, status, requested)
  VALUES
    (v_p01_id, v_hfa_id, v_case_id, v_m1_id, 'Building Permit',                  'document_submission', 'accepted',            true),
    (v_p02_id, v_hfa_id, v_case_id, v_m1_id, 'Environmental Clearance Letter',   'document_submission', 'accepted',            true),
    (v_p03_id, v_hfa_id, v_case_id, v_m1_id, 'Architect Certification of Plans', 'document_submission', 'accepted',            true),
    (v_p04_id, v_hfa_id, v_case_id, v_m1_id, 'Site Control Evidence',            'document_submission', 'accepted',            true),
    (v_p05_id, v_hfa_id, v_case_id, v_m2_id, 'Foundation Inspection Report',          'document_submission', 'received_processing', true),
    (v_p06_id, v_hfa_id, v_case_id, v_m2_id, 'Geo-Technical Report',                  'document_submission', 'pending_open',        false),
    (v_p07_id, v_hfa_id, v_case_id, v_m2_id, 'Engineer Certification of Foundation',  'document_submission', 'pending_open',        false),
    (v_p08_id, v_hfa_id, v_case_id, v_m3_id, 'Framing Inspection Report',    'document_submission', 'pending_open', false),
    (v_p09_id, v_hfa_id, v_case_id, v_m3_id, 'Structural Engineer Sign-Off', 'document_submission', 'pending_open', false),
    (v_p10_id, v_hfa_id, v_case_id, v_m4_id, 'MEP Rough-In Inspection Report',     'document_submission', 'pending_open', false),
    (v_p11_id, v_hfa_id, v_case_id, v_m4_id, 'Energy Code Compliance Certificate', 'document_submission', 'pending_open', false),
    (v_p12_id, v_hfa_id, v_case_id, v_m4_id, 'MEP Engineer Certification',         'document_submission', 'pending_open', false),
    (v_p13_id, v_hfa_id, v_case_id, v_m5_id, 'Certificate of Occupancy',     'document_submission', 'pending_open', false),
    (v_p14_id, v_hfa_id, v_case_id, v_m5_id, 'Final Cost Certification',      'document_submission', 'pending_open', false),
    (v_p15_id, v_hfa_id, v_case_id, v_m5_id, 'HFA Final Inspection Sign-Off', 'document_submission', 'pending_open', false);

  INSERT INTO public.case_participants (id, hfa_id, case_id, user_id, email, role, invite_status, source)
  VALUES
    (v_cp1_id, v_hfa_id, v_case_id, v_hfa_user_id, 'staff@hfa.com',      'hfa_staff', 'accepted', 'creator'),
    (v_cp2_id, v_hfa_id, v_case_id, v_dev_user_id,  'developer@demo.com', 'developer', 'accepted', 'imc');

  INSERT INTO public.conversation_messages (id, hfa_id, case_id, author_id, type, content, created_at)
  VALUES
    (v_msg1_id, v_hfa_id, v_case_id, NULL,           'system',  'Riverside Commons imported from IMC (HC-2024-001). Pre-Construction milestone is now active.',                                                               NOW() - INTERVAL '14 days'),
    (v_msg2_id, v_hfa_id, v_case_id, NULL,           'system',  'Pre-Construction milestone completed. Foundation & Site Work is now active.',                                                                                NOW() - INTERVAL '10 days'),
    (v_msg3_id, v_hfa_id, v_case_id, v_hfa_user_id, 'message', 'Hi Maria, the Foundation & Site Work milestone is now open. Please begin preparing the Foundation Inspection Report and Geo-Technical Report for submission.', NOW() - INTERVAL '9 days'),
    (v_msg4_id, v_hfa_id, v_case_id, v_dev_user_id, 'message', 'Thanks James. The foundation inspection is scheduled for later this week — I''ll upload the signed report as soon as it''s ready.',                           NOW() - INTERVAL '8 days'),
    (v_msg5_id, v_hfa_id, v_case_id, v_hfa_user_id, 'message', 'Sounds good. No rush on the Geo-Technical Report yet — let''s clear the Foundation Inspection first.',                                                        NOW() - INTERVAL '7 days'),
    (v_msg6_id, v_hfa_id, v_case_id, NULL,           'system',  'Foundation Inspection Report received and is currently under review.',                                                                                        NOW() - INTERVAL '6 days'),
    (v_msg7_id, v_hfa_id, v_case_id, v_hfa_user_id, 'message', 'Report is with our structural engineer — expect a decision within 3 business days.',                                                                          NOW() - INTERVAL '5 days');

  -- ════════════════════════════════════════════════════════════════
  -- CASE 2: Oakview Senior Living
  -- ════════════════════════════════════════════════════════════════
  INSERT INTO public.cases (id, hfa_id, title, reference_number, case_type, imc_project_id, created_by)
  VALUES (v_case2_id, v_hfa_id, 'Oakview Senior Living', 'HC-2025-002', 'development_construction', 'HC-2025-002', v_hfa_user_id);

  INSERT INTO public.milestones (id, hfa_id, case_id, title, order_index, status)
  VALUES
    (v_m6_id, v_hfa_id, v_case2_id, 'Site Preparation', 1, 'completed'),
    (v_m7_id, v_hfa_id, v_case2_id, 'Structural Work',  2, 'active'),
    (v_m8_id, v_hfa_id, v_case2_id, 'Interior Fit-Out', 3, 'open');

  INSERT INTO public.prerequisites (id, hfa_id, case_id, milestone_id, title, type, status, requested)
  VALUES
    (v_p16_id, v_hfa_id, v_case2_id, v_m6_id, 'Site Survey Report',            'document_submission', 'accepted',     true),
    (v_p17_id, v_hfa_id, v_case2_id, v_m6_id, 'Environmental Site Assessment', 'document_submission', 'accepted',     true),
    (v_p18_id, v_hfa_id, v_case2_id, v_m6_id, 'Grading and Drainage Permit',   'document_submission', 'accepted',     true),
    (v_p19_id, v_hfa_id, v_case2_id, v_m7_id, 'Structural Inspection Report',          'document_submission', 'pending_open', false),
    (v_p20_id, v_hfa_id, v_case2_id, v_m7_id, 'Foundation Waterproofing Certificate',  'document_submission', 'pending_open', false),
    (v_p21_id, v_hfa_id, v_case2_id, v_m7_id, 'Steel Certification',                   'document_submission', 'pending_open', false),
    (v_p22_id, v_hfa_id, v_case2_id, v_m8_id, 'Interior Framing Inspection', 'document_submission', 'pending_open', false),
    (v_p23_id, v_hfa_id, v_case2_id, v_m8_id, 'Insulation Certificate',       'document_submission', 'pending_open', false);

  INSERT INTO public.case_participants (id, hfa_id, case_id, user_id, email, role, invite_status, source)
  VALUES
    (v_cp3_id, v_hfa_id, v_case2_id, v_hfa_user_id, 'staff@hfa.com',      'hfa_staff', 'accepted', 'creator'),
    (v_cp4_id, v_hfa_id, v_case2_id, v_dev_user_id,  'developer@demo.com', 'developer', 'accepted', 'imc');

  INSERT INTO public.conversation_messages (id, hfa_id, case_id, author_id, type, content, created_at)
  VALUES
    (v_msg8_id,  v_hfa_id, v_case2_id, NULL,           'system',  'Oakview Senior Living imported from IMC (HC-2025-002). Site Preparation milestone is now active.',                                                    NOW() - INTERVAL '5 days'),
    (v_msg9_id,  v_hfa_id, v_case2_id, NULL,           'system',  'Site Preparation milestone completed. Structural Work is now active.',                                                                                 NOW() - INTERVAL '3 days'),
    (v_msg10_id, v_hfa_id, v_case2_id, v_hfa_user_id, 'message', 'Hi Maria, the structural phase has kicked off for Oakview. Please start preparing the Structural Inspection Report.',                                   NOW() - INTERVAL '3 days' + INTERVAL '4 hours'),
    (v_msg11_id, v_hfa_id, v_case2_id, v_dev_user_id, 'message', 'Understood. The structural inspection is scheduled for next week — I''ll upload the report immediately after sign-off.',                                NOW() - INTERVAL '2 days'),
    (v_msg12_id, v_hfa_id, v_case2_id, v_hfa_user_id, 'message', 'Perfect. Also note that the Foundation Waterproofing Certificate and Steel Certification will need to be submitted before this milestone closes.',      NOW() - INTERVAL '1 day');

  RAISE NOTICE 'Reseed complete. Both cases loaded for staff@hfa.com (ID: %).', v_hfa_user_id;
END $$;
