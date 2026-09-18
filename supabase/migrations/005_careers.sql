-- ============================================================
-- LIA Website — Careers & Opportunities Module
-- Migration: 005_careers.sql
-- Phase 25: Public Careers + Admin CMS Opportunities Module
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
-- IMPORTANT: This migration is NON-DESTRUCTIVE.
-- Creates the careers table, indexes, and RLS policies.
-- ============================================================

-- ============================================================
-- 1. CAREERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.careers (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                   TEXT NOT NULL,
  slug                    TEXT NOT NULL UNIQUE,
  organization_name       TEXT NOT NULL,
  organization_website    TEXT,
  organization_logo_url   TEXT,
  opportunity_type        TEXT NOT NULL CHECK (
                            opportunity_type IN ('job', 'internship', 'volunteer', 'project_role', 'fellowship', 'other')
                          ),
  work_mode               TEXT NOT NULL DEFAULT 'on_site' CHECK (
                            work_mode IN ('on_site', 'remote', 'hybrid')
                          ),
  location                TEXT,
  experience_level        TEXT CHECK (
                            experience_level IS NULL OR
                            experience_level IN ('entry_level', 'intermediate', 'mid_level', 'senior_level', 'not_applicable')
                          ),
  remuneration            TEXT,
  application_deadline    TIMESTAMPTZ,
  application_url         TEXT NOT NULL,
  application_label       TEXT DEFAULT 'Apply Now',
  description             TEXT NOT NULL,
  responsibilities        TEXT,
  requirements            TEXT,
  preferred_skills        TEXT,
  benefits                TEXT,
  additional_information  TEXT,
  contact_email           TEXT,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (
                            status IN ('draft', 'published', 'archived')
                          ),
  featured                BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by              UUID REFERENCES auth.users(id),
  updated_by              UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_careers_status               ON public.careers(status);
CREATE INDEX IF NOT EXISTS idx_careers_slug                 ON public.careers(slug);
CREATE INDEX IF NOT EXISTS idx_careers_opportunity_type     ON public.careers(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_careers_work_mode            ON public.careers(work_mode);
CREATE INDEX IF NOT EXISTS idx_careers_application_deadline ON public.careers(application_deadline);
CREATE INDEX IF NOT EXISTS idx_careers_created_at           ON public.careers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_careers_organization_name    ON public.careers(organization_name);
CREATE INDEX IF NOT EXISTS idx_careers_featured             ON public.careers(featured);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;

-- 2.1 Public read access for published careers that have not expired
CREATE POLICY "Public can view published careers" ON public.careers
  FOR SELECT
  USING (
    status = 'published' AND
    (application_deadline IS NULL OR application_deadline >= now())
  );

-- 2.2 Admins (admin + super_admin) have full management access
CREATE POLICY "Admins can manage all careers" ON public.careers
  FOR ALL
  USING (public.is_admin());

-- 2.3 CMS users (super_admin, admin, editor, viewer) can view all careers in CMS
CREATE POLICY "CMS users can select all careers" ON public.careers
  FOR SELECT
  USING (public.is_viewer_or_above());

-- 2.4 Editors can insert careers
CREATE POLICY "Editors can insert careers" ON public.careers
  FOR INSERT
  WITH CHECK (public.is_cms_user());

-- 2.5 Editors can update careers
CREATE POLICY "Editors can update careers" ON public.careers
  FOR UPDATE
  USING (public.is_cms_user());
