-- ============================================================
-- Rotaract Club of Lead India Ahead — MAAYON 2026–27
-- Migration 006: Administrator Transition & Access Control
-- Target: Promote racleadindiaahead2021@gmail.com to super_admin
-- Set password to LiaAdmin@2026! and revoke other admin access
-- ============================================================

-- 1. Update password to LiaAdmin@2026! and ensure email is confirmed
UPDATE auth.users
SET 
  encrypted_password = extensions.crypt('LiaAdmin@2026!', extensions.gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'racleadindiaahead2021@gmail.com';

-- 2. Ensure role constraint allows 'super_admin'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer'));

-- 3. Demote any other administrators / super administrators to 'viewer'
UPDATE public.profiles
SET role = 'viewer',
    updated_at = NOW()
WHERE email != 'racleadindiaahead2021@gmail.com'
  AND role IN ('admin', 'super_admin');

-- 4. If the user already exists in auth.users, ensure a profile row exists as super_admin
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

-- 5. Verification Query: Confirm the active administrator and profile
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name,
  p.updated_at
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'racleadindiaahead2021@gmail.com';

