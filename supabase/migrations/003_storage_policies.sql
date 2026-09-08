-- ============================================================
-- LIA Website — Storage Buckets & Policies
-- Migration: 003_storage_policies.sql
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- CREATE STORAGE BUCKETS
-- ============================================================
-- Note: You can also create these via Supabase Dashboard → Storage

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('event-images',   'event-images',   true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('gallery-images', 'gallery-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('team-images',    'team-images',    true, 5242880,  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES — event-images
-- ============================================================

-- Public can read all event images (images are in public bucket)
CREATE POLICY "Public can view event images" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

-- Only admins can upload event images
CREATE POLICY "Admin can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-images' AND public.is_admin()
  );

-- Only admins can update event images
CREATE POLICY "Admin can update event images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-images' AND public.is_admin()
  );

-- Only admins can delete event images
CREATE POLICY "Admin can delete event images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-images' AND public.is_admin()
  );

-- ============================================================
-- STORAGE POLICIES — project-images
-- ============================================================
CREATE POLICY "Public can view project images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Admin can upload project images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-images' AND public.is_admin()
  );

CREATE POLICY "Admin can update project images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-images' AND public.is_admin()
  );

CREATE POLICY "Admin can delete project images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-images' AND public.is_admin()
  );

-- ============================================================
-- STORAGE POLICIES — gallery-images
-- ============================================================
CREATE POLICY "Public can view gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "Admin can upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery-images' AND public.is_admin()
  );

CREATE POLICY "Admin can update gallery images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gallery-images' AND public.is_admin()
  );

CREATE POLICY "Admin can delete gallery images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery-images' AND public.is_admin()
  );

-- ============================================================
-- STORAGE POLICIES — team-images
-- ============================================================
CREATE POLICY "Public can view team images" ON storage.objects
  FOR SELECT USING (bucket_id = 'team-images');

CREATE POLICY "Admin can upload team images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'team-images' AND public.is_admin()
  );

CREATE POLICY "Admin can update team images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'team-images' AND public.is_admin()
  );

CREATE POLICY "Admin can delete team images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'team-images' AND public.is_admin()
  );
