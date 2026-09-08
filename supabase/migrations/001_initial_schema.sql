-- ============================================================
-- LIA Website — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent users from self-promoting their role
CREATE OR REPLACE FUNCTION public.prevent_role_self_promotion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only allow role changes by an admin (via service-role key or admin function)
  IF OLD.role != NEW.role AND auth.uid() = NEW.id THEN
    RAISE EXCEPTION 'Users cannot modify their own role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_role_self_promotion_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_promotion();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- 2. EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  subtitle        TEXT,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  short_description TEXT,
  event_date      DATE,
  display_date    TEXT,
  start_time      TEXT,
  end_time        TEXT,
  venue           TEXT,
  city            TEXT DEFAULT 'Coimbatore',
  category        TEXT DEFAULT 'Other',
  organizer       TEXT,
  organizer_type  TEXT DEFAULT 'LIA',
  lia_role        TEXT DEFAULT 'Organizer',
  collaborators   TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image_url TEXT,
  external_url    TEXT,
  instagram_url   TEXT,
  linkedin_url    TEXT,
  source_platform TEXT,
  source_url      TEXT,
  source_verified BOOLEAN DEFAULT FALSE,
  year            INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id),
  updated_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_events_status      ON public.events(status);
CREATE INDEX idx_events_event_date  ON public.events(event_date DESC);
CREATE INDEX idx_events_slug        ON public.events(slug);
CREATE INDEX idx_events_featured    ON public.events(featured);
CREATE INDEX idx_events_year        ON public.events(year DESC);

-- ============================================================
-- 3. EVENT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  storage_path TEXT,
  caption     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_cover    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_images_event_id   ON public.event_images(event_id);
CREATE INDEX idx_event_images_sort_order ON public.event_images(event_id, sort_order);

-- ============================================================
-- 4. POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  excerpt         TEXT,
  content         TEXT,
  cover_image_url TEXT,
  category        TEXT DEFAULT 'General',
  author          TEXT DEFAULT 'LIA Team',
  publish_date    DATE,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  instagram_url   TEXT,
  linkedin_url    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id),
  updated_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_posts_status      ON public.posts(status);
CREATE INDEX idx_posts_slug        ON public.posts(slug);
CREATE INDEX idx_posts_featured    ON public.posts(featured);
CREATE INDEX idx_posts_publish_date ON public.posts(publish_date DESC);

-- ============================================================
-- 5. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  short_description TEXT,
  category        TEXT DEFAULT 'Community Service',
  project_date    TEXT,
  year            INTEGER,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image_url TEXT,
  collaborators   TEXT[] DEFAULT '{}',
  impact_metrics  JSONB DEFAULT '[]',
  source_platform TEXT,
  source_url      TEXT,
  source_verified BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id),
  updated_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_projects_status   ON public.projects(status);
CREATE INDEX idx_projects_slug     ON public.projects(slug);
CREATE INDEX idx_projects_featured ON public.projects(featured);
CREATE INDEX idx_projects_year     ON public.projects(year DESC);

-- ============================================================
-- 6. PROJECT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_images (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  storage_path TEXT,
  caption      TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_images_project_id ON public.project_images(project_id);

-- ============================================================
-- 7. GALLERY ALBUMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  event_id        UUID REFERENCES public.events(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  published       BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_albums_published ON public.gallery_albums(published);
CREATE INDEX idx_gallery_albums_event_id  ON public.gallery_albums(event_id);

-- ============================================================
-- 8. GALLERY IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id     UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL,
  image_url    TEXT NOT NULL,
  storage_path TEXT,
  title        TEXT,
  caption      TEXT,
  category     TEXT DEFAULT 'EVENTS',
  date         TEXT,
  featured     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_images_album_id ON public.gallery_images(album_id);
CREATE INDEX idx_gallery_images_featured ON public.gallery_images(featured);
CREATE INDEX idx_gallery_images_category ON public.gallery_images(category);

-- ============================================================
-- 9. TEAM MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  designation       TEXT NOT NULL,
  bio               TEXT,
  profile_image_url TEXT,
  letter_image_url  TEXT,
  term              TEXT DEFAULT '2026–27',
  college_company   TEXT,
  blood_group       TEXT,
  is_executive      BOOLEAN NOT NULL DEFAULT FALSE,
  display_order     INTEGER NOT NULL DEFAULT 0,
  published         BOOLEAN NOT NULL DEFAULT TRUE,
  instagram_url     TEXT,
  linkedin_url      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_members_published     ON public.team_members(published);
CREATE INDEX idx_team_members_display_order ON public.team_members(display_order);
CREATE INDEX idx_team_members_is_executive  ON public.team_members(is_executive);

-- ============================================================
-- 10. WEBSITE CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS public.website_content (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section     TEXT NOT NULL,
  key         TEXT NOT NULL,
  value       TEXT,
  value_json  JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(section, key)
);

CREATE INDEX idx_website_content_section ON public.website_content(section, key);

-- ============================================================
-- 11. SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT,
  label       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_settings_key ON public.site_settings(key);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_gallery_albums_updated_at
  BEFORE UPDATE ON public.gallery_albums
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_website_content_updated_at
  BEFORE UPDATE ON public.website_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings   ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- EVENTS — Public read of published; Admin full CRUD
CREATE POLICY "Public can read published events" ON public.events
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admin can manage all events" ON public.events
  FOR ALL USING (public.is_admin());

-- EVENT IMAGES — Public read; Admin full CRUD
CREATE POLICY "Public can read event images" ON public.event_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_images.event_id AND e.status = 'published'
    )
  );

CREATE POLICY "Admin can manage all event images" ON public.event_images
  FOR ALL USING (public.is_admin());

-- POSTS
CREATE POLICY "Public can read published posts" ON public.posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admin can manage all posts" ON public.posts
  FOR ALL USING (public.is_admin());

-- PROJECTS
CREATE POLICY "Public can read published projects" ON public.projects
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admin can manage all projects" ON public.projects
  FOR ALL USING (public.is_admin());

-- PROJECT IMAGES
CREATE POLICY "Public can read project images" ON public.project_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_images.project_id AND p.status = 'published'
    )
  );

CREATE POLICY "Admin can manage all project images" ON public.project_images
  FOR ALL USING (public.is_admin());

-- GALLERY ALBUMS
CREATE POLICY "Public can read published albums" ON public.gallery_albums
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admin can manage all albums" ON public.gallery_albums
  FOR ALL USING (public.is_admin());

-- GALLERY IMAGES
CREATE POLICY "Public can read gallery images in published albums" ON public.gallery_images
  FOR SELECT USING (
    album_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.gallery_albums ga
      WHERE ga.id = gallery_images.album_id AND ga.published = TRUE
    )
  );

CREATE POLICY "Admin can manage all gallery images" ON public.gallery_images
  FOR ALL USING (public.is_admin());

-- TEAM MEMBERS
CREATE POLICY "Public can read published team members" ON public.team_members
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Admin can manage all team members" ON public.team_members
  FOR ALL USING (public.is_admin());

-- WEBSITE CONTENT
CREATE POLICY "Public can read website content" ON public.website_content
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin can manage website content" ON public.website_content
  FOR ALL USING (public.is_admin());

-- SITE SETTINGS
CREATE POLICY "Public can read site settings" ON public.site_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin can manage site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());
