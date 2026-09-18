-- ============================================================
-- LIA Website — CMS V2 Governance Migration
-- Migration: 004_cms_v2.sql
-- Phase 24: Multi-role RBAC + Audit Logs + Granular RLS
-- Run this ONCE in: Supabase Dashboard → SQL Editor
-- ============================================================
-- IMPORTANT: This migration is NON-DESTRUCTIVE.
-- No DROP TABLE, no TRUNCATE, no existing data removal.
-- ============================================================

-- ============================================================
-- STEP 1: Add 'super_admin' to the profiles role constraint
-- ============================================================

-- Drop old constraint and add the new one with super_admin
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer'));

-- ============================================================
-- STEP 2: Upgrade ONLY the designated primary administrator
-- to super_admin.
-- 
-- We upgrade ONLY the known primary admin email.
-- DO NOT use: UPDATE profiles SET role = 'super_admin' WHERE role = 'admin';
-- That would upgrade ALL admins. Instead, target specifically.
-- ============================================================

UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'racleadindiaahead2021@gmail.com'
  AND role = 'admin';

-- ============================================================
-- STEP 3: Helper Functions
-- ============================================================

-- is_super_admin(): returns true only for super_admin role
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- is_admin(): backward compatible — true for admin OR super_admin
-- Existing code calling is_admin() will continue to work for super_admin too.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

-- is_cms_user(): true for any CMS user (super_admin, admin, editor)
-- Viewers get SELECT but cannot write
CREATE OR REPLACE FUNCTION public.is_cms_user()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
  );
$$;

-- is_viewer_or_above(): true for all authenticated CMS users (including viewer)
CREATE OR REPLACE FUNCTION public.is_viewer_or_above()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor', 'viewer')
  );
$$;

-- ============================================================
-- STEP 4: Strengthen the role-change security trigger
-- 
-- Only super_admin can change any profile's role.
-- Regular admins/editors/viewers cannot promote/demote anyone.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_role TEXT;
BEGIN
  -- Only run if the role is actually being changed
  IF OLD.role = NEW.role THEN
    RETURN NEW;
  END IF;

  -- Get the role of the currently authenticated user
  SELECT role INTO current_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Only super_admin may change any role
  IF current_role IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Only a super_admin may change user roles. Current role: %', COALESCE(current_role, 'unauthenticated');
  END IF;

  RETURN NEW;
END;
$$;

-- Drop old trigger and replace with the strengthened version
DROP TRIGGER IF EXISTS prevent_role_self_promotion_trigger ON public.profiles;

CREATE TRIGGER prevent_unauthorized_role_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_unauthorized_role_change();

-- ============================================================
-- STEP 5: Audit Logs Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  TEXT,
  user_name   TEXT,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  entity_name TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id     ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON public.audit_logs(created_at DESC);

-- ============================================================
-- STEP 6: Audit Logs RLS
-- ============================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Super admins and admins can SELECT audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- Any authenticated CMS user can INSERT audit logs (append-only)
-- No UPDATE or DELETE policies — making this effectively append-only
CREATE POLICY "CMS users can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND public.is_viewer_or_above());

-- ============================================================
-- STEP 7: Update RLS Policies for Content Tables
-- 
-- Old: is_admin() only
-- New: Granular — editor can INSERT/UPDATE, only admin/super_admin can DELETE
-- ============================================================

-- ---- EVENTS ----
DROP POLICY IF EXISTS "Admin can manage all events" ON public.events;

-- Admins (and super_admin): full CRUD
CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (public.is_admin());

-- Editors: SELECT all + INSERT + UPDATE (no DELETE)
CREATE POLICY "Editors can select all events" ON public.events
  FOR SELECT USING (public.is_cms_user());

CREATE POLICY "Editors can insert events" ON public.events
  FOR INSERT WITH CHECK (public.is_cms_user());

CREATE POLICY "Editors can update events" ON public.events
  FOR UPDATE USING (public.is_cms_user());

-- Viewers: SELECT all (including drafts) in CMS
CREATE POLICY "Viewers can select events in CMS" ON public.events
  FOR SELECT USING (public.is_viewer_or_above());

-- ---- EVENT IMAGES ----
DROP POLICY IF EXISTS "Admin can manage all event images" ON public.event_images;

CREATE POLICY "Admins can manage all event images" ON public.event_images
  FOR ALL USING (public.is_admin());

CREATE POLICY "Editors can manage event images" ON public.event_images
  FOR INSERT WITH CHECK (public.is_cms_user());

CREATE POLICY "Editors can update event images" ON public.event_images
  FOR UPDATE USING (public.is_cms_user());

CREATE POLICY "CMS users can select event images" ON public.event_images
  FOR SELECT USING (public.is_viewer_or_above());

-- ---- POSTS ----
DROP POLICY IF EXISTS "Admin can manage all posts" ON public.posts;

CREATE POLICY "Admins can manage all posts" ON public.posts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Editors can select all posts" ON public.posts
  FOR SELECT USING (public.is_cms_user());

CREATE POLICY "Editors can insert posts" ON public.posts
  FOR INSERT WITH CHECK (public.is_cms_user());

CREATE POLICY "Editors can update posts" ON public.posts
  FOR UPDATE USING (public.is_cms_user());

CREATE POLICY "Viewers can select posts in CMS" ON public.posts
  FOR SELECT USING (public.is_viewer_or_above());

-- ---- PROJECTS ----
DROP POLICY IF EXISTS "Admin can manage all projects" ON public.projects;

CREATE POLICY "Admins can manage all projects" ON public.projects
  FOR ALL USING (public.is_admin());

CREATE POLICY "Editors can select all projects" ON public.projects
  FOR SELECT USING (public.is_cms_user());

CREATE POLICY "Editors can insert projects" ON public.projects
  FOR INSERT WITH CHECK (public.is_cms_user());

CREATE POLICY "Editors can update projects" ON public.projects
  FOR UPDATE USING (public.is_cms_user());

CREATE POLICY "Viewers can select projects in CMS" ON public.projects
  FOR SELECT USING (public.is_viewer_or_above());

-- ---- PROJECT IMAGES ----
DROP POLICY IF EXISTS "Admin can manage all project images" ON public.project_images;

CREATE POLICY "Admins can manage all project images" ON public.project_images
  FOR ALL USING (public.is_admin());

CREATE POLICY "Editors can insert project images" ON public.project_images
  FOR INSERT WITH CHECK (public.is_cms_user());

CREATE POLICY "Editors can update project images" ON public.project_images
  FOR UPDATE USING (public.is_cms_user());

CREATE POLICY "CMS users can select project images" ON public.project_images
  FOR SELECT USING (public.is_viewer_or_above());

-- ---- GALLERY ALBUMS ----
DROP POLICY IF EXISTS "Admin can manage all albums" ON public.gallery_albums;

CREATE POLICY "Admins can manage all albums" ON public.gallery_albums
  FOR ALL USING (public.is_admin());

CREATE POLICY "Editors can insert albums" ON public.gallery_albums
  FOR INSERT WITH CHECK (public.is_cms_user());

CREATE POLICY "Editors can update albums" ON public.gallery_albums
  FOR UPDATE USING (public.is_cms_user());

CREATE POLICY "CMS users can select all albums" ON public.gallery_albums
  FOR SELECT USING (public.is_viewer_or_above());

-- ---- GALLERY IMAGES ----
DROP POLICY IF EXISTS "Admin can manage all gallery images" ON public.gallery_images;

CREATE POLICY "Admins can manage all gallery images" ON public.gallery_images
  FOR ALL USING (public.is_admin());

CREATE POLICY "Editors can insert gallery images" ON public.gallery_images
  FOR INSERT WITH CHECK (public.is_cms_user());

CREATE POLICY "Editors can update gallery images" ON public.gallery_images
  FOR UPDATE USING (public.is_cms_user());

CREATE POLICY "CMS users can select all gallery images" ON public.gallery_images
  FOR SELECT USING (public.is_viewer_or_above());

-- ---- TEAM MEMBERS ----
DROP POLICY IF EXISTS "Admin can manage all team members" ON public.team_members;

CREATE POLICY "Admins can manage all team members" ON public.team_members
  FOR ALL USING (public.is_admin());

CREATE POLICY "Editors can insert team members" ON public.team_members
  FOR INSERT WITH CHECK (public.is_cms_user());

CREATE POLICY "Editors can update team members" ON public.team_members
  FOR UPDATE USING (public.is_cms_user());

CREATE POLICY "CMS users can select all team members" ON public.team_members
  FOR SELECT USING (public.is_viewer_or_above());

-- ---- WEBSITE CONTENT ----
DROP POLICY IF EXISTS "Admin can manage website content" ON public.website_content;

CREATE POLICY "Admins can manage website content" ON public.website_content
  FOR ALL USING (public.is_admin());

CREATE POLICY "Editors can update website content" ON public.website_content
  FOR UPDATE USING (public.is_cms_user());

-- ---- SITE SETTINGS ----
DROP POLICY IF EXISTS "Admin can manage site settings" ON public.site_settings;

-- Only admins/super_admins manage critical settings
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());

-- ---- PROFILES ----
-- Allow super_admin to SELECT all profiles (for user management)
CREATE POLICY "Super admin can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_super_admin());

-- Allow super_admin to UPDATE roles (trigger enforces this at DB level)
CREATE POLICY "Super admin can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_super_admin());

-- Allow any CMS user to update their OWN profile (name, not role — trigger protects role)
CREATE POLICY "Users can update own profile name" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- STEP 8: Verify the upgrade was applied correctly
-- (Returns the count of super_admins — should be 1)
-- ============================================================

-- SELECT COUNT(*) FROM public.profiles WHERE role = 'super_admin';
-- Should return 1 if racleadindiaahead2021@gmail.com was the only admin.

-- ============================================================
-- END OF MIGRATION 004_cms_v2.sql
-- ============================================================
