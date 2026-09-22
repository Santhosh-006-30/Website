# Rotaract Club of Lead India Ahead — Production Operations Manual
**MAAYON 2026–27 | Rotaract District 3206, Coimbatore**

---

## 1. System Overview

- **Production URL**: `https://lia-website-six.vercel.app`
- **Source Repository**: `main` branch
- **Hosting Platform**: Vercel (Edge CDN + Static Site Hosting)
- **Database & Auth Platform**: Supabase (PostgreSQL 15+, GoTrue Auth, PostgREST, Row-Level Security)

---

## 2. Architecture & Production Topology

```
[ User Browser / Mobile Device ]
              │
              ▼ (HTTPS / HTTP/2)
    [ Vercel Edge Network ]
      ├── Security Headers (CSP, HSTS, X-Frame-Options: DENY, etc.)
      ├── Static Assets (/assets/* — Cache-Control: max-age=31536000, immutable)
      ├── Metadata (/manifest.json, /sitemap.xml, /robots.txt — max-age=3600)
      └── SPA Rewrite (/(.*) -> /index.html)
              │
              ▼
    [ React 18 SPA Client ]
      ├── Dynamic Data Queries ──────────► [ Supabase PostgREST & Auth ]
      └── Local Analytics (Zero PII) ───► [ LocalStorage (30-day rolling cap) ]
```

### Key Components

1. **Client Shell**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion (respects `prefers-reduced-motion`).
2. **Bundle Optimization**: Code-split into vendor chunks (`vendor-react`, `vendor-framer`, `vendor-supabase`, `vendor-tiptap`) with route-level lazy loading. Initial public JS footprint is maintained at ~182 kB.
3. **PWA & Mobile Installability**:
   - Web App Manifest: `/manifest.json` configured for `display: standalone`, themed with brand color `#07111F`.
   - Meta tags: iOS web-app-capable and mobile viewport optimizations.
   - **Service Worker Decision**: By explicit design, no Service Worker is registered. This eliminates cache invalidation hazards, stale auth session loops, and out-of-sync Supabase database states while preserving high CDN-cached asset performance.
4. **Analytics Architecture**:
   - **Storage**: Client-side `localStorage` only.
   - **Database Impact**: Zero Supabase database tables or writes required for analytics.
   - **Privacy**: Respects `Do Not Track` (DNT), captures zero PII, zero IP addresses, with a 500-event / 30-day retention cap.
   - **Performance**: Event capture deferred via `requestIdleCallback`. Excludes administrative routes (`/admin/*`).

---

## 3. Environment & Configuration

| Variable | Environment | Description | Safety Level |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Client / Build | Supabase project API URL (`https://<project-ref>.supabase.co`) | Public Safe |
| `VITE_SUPABASE_ANON_KEY` | Client / Build | PostgREST public anonymous key with RLS enforcement | Public Safe |

> [!CAUTION]
> **CRITICAL SECURITY RULE**: Never set or expose `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables, `.env` files, or any client-side code. The client must interact strictly via `VITE_SUPABASE_ANON_KEY` guarded by Row-Level Security (RLS).

---

## 4. Database Migrations & Status

All database migrations reside in `supabase/migrations/`:

| Migration File | Feature | Prod Status | Activation Guide |
| :--- | :--- | :--- | :--- |
| `001_initial_schema.sql` | Core club structure & leadership | ACTIVE | Initial deployment |
| `002_storage_and_indexes.sql` | Storage buckets & performance | ACTIVE | Initial deployment |
| `003_events_schema.sql` | Events & gallery integration | ACTIVE | Initial deployment |
| `004_projects_schema.sql` | Projects & avenues | ACTIVE | Initial deployment |
| `005_careers.sql` | Careers / opportunities module | PENDING MANUAL ACTIVATION | See [`docs/PHASE_29_PRODUCTION_ACTIONS.md`](./PHASE_29_PRODUCTION_ACTIONS.md) |

### Failure Resilience
If `005_careers.sql` has not yet been run on the production database, the application handles `PGRST205` safely without errors or blank screens: the frontend catches the missing relation and returns an empty list `[]`.

---

## 5. Security & HTTP Header Policy

The production deployment enforces strict headers via `vercel.json`:

- **Content-Security-Policy**: Restricts script/style/font/image/connect origins. Only trusted origins (`fonts.googleapis.com`, `fonts.gstatic.com`, `*.supabase.co`, `images.unsplash.com`) are allowed.
- **Strict-Transport-Security**: `max-age=31536000; includeSubDomains` (1 year HSTS).
- **X-Frame-Options**: `DENY` (prevents clickjacking).
- **X-Content-Type-Options**: `nosniff`.
- **Permissions-Policy**: Restricts camera, microphone, geolocation, usb, and payment APIs.
- **Referrer-Policy**: `strict-origin-when-cross-origin`.

---

## 6. Build, Test & Deployment Workflow

### Pre-Deployment Verification (Local)
```bash
# Type check without emitting files
npx tsc -b --noEmit

# Lint for syntax and style standards
npm run lint

# Production build test
npm run build
```

### Deployment Pipeline
- Pushing to the `main` branch automatically triggers Vercel CI/CD production build and atomic deployment.
- Static assets receive immutable content hashes (`/assets/index-[hash].js`).

### Rollback Procedure
If an issue is detected post-deployment:
1. Open the [Vercel Dashboard](https://vercel.com).
2. Navigate to **Deployments**.
3. Locate the previous known-healthy deployment.
4. Click the three dots menu `...` and select **Instant Rollback**.
5. The rollback takes effect instantly at the edge without requiring a git rebuild.
