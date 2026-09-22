# Production Release & Verification Checklist
**Rotaract Club of Lead India Ahead — MAAYON 2026–27**

This checklist must be followed for all releases to the production environment (`https://lia-website-six.vercel.app`).

---

## 1. Pre-Deployment Verification (Local)

- [ ] **TypeScript Check**: `npx tsc -b --noEmit` exits with code 0 (zero errors).
- [ ] **Linter**: `npm run lint` completes cleanly without warnings or errors.
- [ ] **Vulnerability Audit**: `npm audit` reports 0 high/critical vulnerabilities.
- [ ] **Production Build**: `npm run build` succeeds in < 5 seconds.
- [ ] **Bundle Size Budget**:
  - Initial public bundle `dist/assets/index-*.js` < 190 kB (target: ~182 kB).
  - Code-split vendor chunks (`vendor-react`, `vendor-framer`, `vendor-supabase`, `vendor-tiptap`) are properly separated.
- [ ] **Clean Git Tree**: No unintended files, `.env` files, or temporary debug logs are staged.
- [ ] **Environment Safety**: Confirm `SUPABASE_SERVICE_ROLE_KEY` is nowhere in the repository.

---

## 2. Deployment Execution

- [ ] Ensure working branch is synced with `main`:
  ```bash
  git checkout main
  git pull origin main
  ```
- [ ] Push verified commit to `origin main`:
  ```bash
  git push origin main
  ```
- [ ] Open [Vercel Dashboard](https://vercel.com) and confirm deployment build status passes (`Ready`).

---

## 3. Post-Deployment Smoke Tests (Live Production)

Verify all core URLs respond with HTTP 200:

| Endpoint | Expected Status | Purpose | Verified |
| :--- | :--- | :--- | :--- |
| `https://lia-website-six.vercel.app/` | 200 OK | Main landing page | [ ] |
| `https://lia-website-six.vercel.app/events` | 200 OK | Events directory | [ ] |
| `https://lia-website-six.vercel.app/careers` | 200 OK | Careers page (fallback safe) | [ ] |
| `https://lia-website-six.vercel.app/robots.txt` | 200 OK | Search engine crawler rules | [ ] |
| `https://lia-website-six.vercel.app/sitemap.xml` | 200 OK | Canonical URL sitemap | [ ] |
| `https://lia-website-six.vercel.app/manifest.json` | 200 OK | PWA Web App Manifest | [ ] |

---

## 4. Mobile & PWA Quality Checklist

- [ ] **PWA Manifest Valid**: Verify `/manifest.json` serves valid JSON with correct name, icons, and `theme_color: "#07111F"`.
- [ ] **Meta Tags Present**:
  - `<meta name="theme-color" content="#07111F" />`
  - `<link rel="apple-touch-icon" href="/assets/logos/lia-shield.png" />`
  - `<meta name="apple-mobile-web-app-capable" content="yes" />`
- [ ] **Mobile Navigation**:
  - Hamburger toggle opens full-screen overlay menu.
  - Background scrolling is locked when mobile menu is open.
  - Pressing `Escape` or clicking navigation links closes the menu smoothly.
- [ ] **Touch Targets**: All navigation links and CTA buttons have minimum touch target sizes (≥ 44×44px).
- [ ] **No Horizontal Overflow**: Verify `overflow-x: hidden` prevents horizontal scrolling on mobile viewports (320px–428px).

---

## 5. Database & Feature Activation (Supabase)

- [ ] **Core Schema**: Verify existing tables (`events`, `projects`, `board_members`) respond to queries.
- [ ] **Careers Schema (`005_careers.sql`)**:
  - Status: Check if migration has been run in Supabase SQL Editor.
  - If pending: Follow instructions in [`docs/PHASE_29_PRODUCTION_ACTIONS.md`](./PHASE_29_PRODUCTION_ACTIONS.md).
  - If applied: Verify `/careers` shows active listings without errors.
- [ ] **Analytics**:
  - Confirm analytics functions client-side via `localStorage`.
  - Zero database tables required for page views tracking.

---

## 6. Incident Response & Rollback Checklist

- [ ] **Trigger Criteria**: Visual broken layouts, unhandled React runtime exceptions on public pages, or auth failures.
- [ ] **Action**:
  1. Navigate to Vercel Project Dashboard → Deployments.
  2. Select previous stable deployment.
  3. Execute **Instant Rollback**.
  4. File issue or branch for post-mortem analysis.
