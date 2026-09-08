# Rotaract Club of Lead India Ahead (LIA) — Official Website & Admin CMS

Official web platform for the **Rotaract Club of Lead India Ahead** (Rotaract District 3206, Coimbatore). 
Features a public-facing website built with high-performance glassmorphism aesthetics, paired with a custom, secure **Admin CMS** powered by Supabase.

---

## 🌟 Key Capabilities

### Public Portal
- **Hero & Mission**: Dynamic theme showcase, leadership identity, and interactive stats.
- **Verified Events Timeline**: Chronological records with categories, dates, venues, and modals.
- **Signature Projects**: Asymmetric interactive cards detailing community initiatives and impact metrics.
- **Leadership & Board**: Board of Directors directory with appointment letter view modal.
- **Photo Gallery**: Masonry grid with category filters and full-screen lightbox preview.
- **Zero-Downtime Fallbacks**: Automatically falls back to static verified club records if Supabase is offline or unconfigured.

### Admin CMS (`/admin`)
- **Secure Authentication**: Supabase Auth with server-side Row Level Security (RLS) enforcement and role verification.
- **Events Management**: Create, edit, publish/unpublish, archive, and manage multi-photo galleries per event.
- **Posts & Articles**: Rich text editor powered by Tiptap (headings, lists, quotes, formatting, links).
- **Projects CMS**: Track signature initiatives, update impact metrics, and associate partner clubs.
- **Photo Gallery CMS**: Create event-linked or standalone albums, batch drag-and-drop uploads to Supabase Storage.
- **Leadership & Team**: Manage board appointments, upload profile pictures and official appointment letters.
- **Homepage Content**: Live customization of headlines, impact numbers, vision, and join-us links.
- **Global Settings**: Configure club metadata, contact details, social links, and SEO tags.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 3.4
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Rich Text**: Tiptap
- **Backend & Database**: Supabase (PostgreSQL 15+, Auth, Storage, RLS)
- **Deployment**: Vercel (SPA rewrites configured in `vercel.json`)

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+
- A free account on [Supabase](https://supabase.com)

### 2. Clone & Install
```bash
git clone https://github.com/Santhosh-006-30/Website.git
cd Website
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Locally
```bash
npm run dev
```
- Public website: `http://localhost:5173`
- Admin CMS login: `http://localhost:5173/admin/login`

---

## 🗄 Supabase Database & Storage Setup

Run the migrations in order via the **Supabase SQL Editor**:

### Step 1: Run `001_initial_schema.sql`
Creates all tables (`profiles`, `events`, `event_images`, `posts`, `projects`, `project_images`, `gallery_albums`, `gallery_images`, `team_members`, `website_content`, `site_settings`), custom types, RLS security policies, and the `is_admin()` function.

### Step 2: Run `002_seed_data.sql`
Seeds the database with existing club events, signature projects, team members, gallery photos, and website copy.

### Step 3: Run `003_storage_policies.sql`
Sets up public read access and admin-only upload/delete permissions for:
- `event-images`
- `project-images`
- `gallery-images`
- `team-images`

### Step 4: Create the First Administrator
1. In Supabase Dashboard, go to **Authentication -> Users** and click **Add User**.
2. Enter the admin email and a secure password.
3. In the SQL Editor, grant admin privileges to that user:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_UUID_FROM_AUTH_USERS';
```
*(Alternatively, insert a profile record if not automatically created by trigger)*.

---

## 🌐 Production Deployment (Vercel)

The repository includes `vercel.json` with SPA routing configuration:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

In your Vercel Project Settings, add these Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🛡 Security Architecture

- **No Secret Keys in Frontend**: Only `VITE_SUPABASE_ANON_KEY` is exposed to the browser.
- **Server-Side Authorization**: Every table is protected with PostgreSQL Row Level Security (`RLS`).
- **Storage Protection**: Non-admin users cannot upload or delete files from storage buckets.
- **Generic Auth Errors**: Prevents username/email harvesting on the login portal.
