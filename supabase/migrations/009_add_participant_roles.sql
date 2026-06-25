-- Bolt 017: extend participant_role enum with inspector, lender, architect
ALTER TYPE public.participant_role ADD VALUE IF NOT EXISTS 'inspector';
ALTER TYPE public.participant_role ADD VALUE IF NOT EXISTS 'lender';
ALTER TYPE public.participant_role ADD VALUE IF NOT EXISTS 'architect';
