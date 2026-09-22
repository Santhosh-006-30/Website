-- ============================================================
-- Rotaract Club of Lead India Ahead — MAAYON 2026–27
-- Migration 006: Administrator Transition & Access Control
-- Target: Promote racleadindiaahead2021@gmail.com to super_admin
-- Revoke administrative access from any previous accounts
-- ============================================================

-- Ensure role constraint allows 'super_admin'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer'));

-- 1. Demote any other administrators / super administrators to 'viewer'
UPDATE public.profiles
SET role = 'viewer',
    updated_at = NOW()
WHERE email != 'racleadindiaahead2021@gmail.com'
  AND role IN ('admin', 'super_admin');

-- 2. If the user already exists in auth.users, ensure a profile row exists
INSERT INTO public.profiles (id, email, role, full_name, created_at, updated_at)
SELECT 
  id, 
  email, 
  'super_admin', 
  'LIA Administrator', 
  NOW(), 
  NOW()
FROM auth.users
WHERE email = 'racleadindiaahead2021@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin',
    email = 'racleadindiaahead2021@gmail.com',
    updated_at = NOW();

-- 3. Verification Query: Confirm the active administrators
SELECT 
  p.id,
  p.email,
  p.role,
  p.full_name,
  p.updated_at
FROM public.profiles p
WHERE p.role IN ('admin', 'super_admin');
