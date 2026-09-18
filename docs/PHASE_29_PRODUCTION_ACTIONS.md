# PHASE 29 — PRODUCTION ACTIONS & RUNBOOK
## Rotaract Club of Lead India Ahead — MAAYON 2026–27

This runbook outlines the exact manual procedures for activating and verifying the Careers database migration and production runtime configuration.

---

## 1. Careers Database Activation (`005_careers.sql`)

### Status Assessment
- **Diagnostic Result**: Confirmed via Supabase PostgREST API query that `public.careers` is currently **NOT** deployed in the production database (returns `PGRST205: Could not find the table 'public.careers' in the schema cache`).
- **Frontend State**: All public and CMS pages handle this state gracefully without runtime crashes or white screens. Public career listing safely presents the fallback empty state.
- **Migration Location**: [`supabase/migrations/005_careers.sql`](../supabase/migrations/005_careers.sql)

### Execution Steps
1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select the **Rotaract Club of Lead India Ahead** project.
3. In the left navigation menu, open **SQL Editor**.
4. Click **New Query**.
5. Copy and paste the entire contents of [`supabase/migrations/005_careers.sql`](../supabase/migrations/005_careers.sql).
6. Click **Run** (or `Ctrl` + `Enter`).
7. Confirm that the query succeeds with message: `Success. No rows returned`.

### Non-Destructive Nature & Idempotency
- Uses `CREATE TABLE IF NOT EXISTS public.careers`.
- Uses `CREATE INDEX IF NOT EXISTS` for all 8 performance indexes.
- Enables Row-Level Security (RLS) with explicit separation between public read and CMS governance roles.

---

## 2. Post-Migration Verification Queries

Run each verification query in the **SQL Editor** to confirm full operational readiness:

### A. Confirm Table Structure & Indexes
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'careers'
ORDER BY ordinal_position;
```

### B. Verify Row Level Security (RLS) is Active
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'careers';
-- rowsecurity must be TRUE
```

### C. Verify Active RLS Policies
```sql
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'careers';
-- Expected policies:
-- 1. "Public can view published careers" (SELECT, public)
-- 2. "Admins can manage all careers" (ALL, is_admin())
-- 3. "CMS users can select all careers" (SELECT, is_viewer_or_above())
-- 4. "Editors can insert careers" (INSERT, is_cms_user())
-- 5. "Editors can update careers" (UPDATE, is_cms_user())
```

---

## 3. Production Environment & Secrets Safety

- **Public Key Only**: The frontend application MUST ONLY use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **CRITICAL WARNING**: NEVER expose `SUPABASE_SERVICE_ROLE_KEY` in `.env`, `.env.local`, Vercel environment variables, or frontend code.
- Ensure Vercel project environment variables match the production Supabase instance settings.

---

## 4. Rollback Plan

If an unexpected conflict occurs during or after migration execution:

```sql
-- Optional Rollback Query (DO NOT run unless explicitly rolling back the feature)
DROP TABLE IF EXISTS public.careers CASCADE;
```
*Note: Dropping the table will cascade to all associated indexes and policies.*
