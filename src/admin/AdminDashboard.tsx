import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, FileText, FolderKanban, Image, Users, Plus,
  TrendingUp, Clock, ArrowRight,
} from 'lucide-react';
import { adminGetEventStats } from '../services/events';
import { adminGetPostStats } from '../services/posts';
import { adminGetGalleryStats } from '../services/gallery';
import { adminGetProjectStats } from '../services/projects';
import { adminGetTeamStats } from '../services/team';
import { LoadingSpinner } from './shared/LoadingSpinner';

interface DashboardStats {
  events: { total: number; published: number; draft: number; archived: number };
  posts: { total: number; published: number; draft: number };
  gallery: { total: number; albums: number };
  projects: { total: number; published: number; featured: number };
  team: { total: number; published: number };
}

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  to: string;
  accentColor?: string;
}

function StatCard({ label, value, sub, icon, to, accentColor = '#D7B65A' }: StatCardProps) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{
        background: 'rgba(14, 27, 48, 0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
        <ArrowRight
          className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors"
        />
      </div>
      <p className="text-3xl font-bold text-slate-100 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </Link>
  );
}

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function QuickAction({ to, icon, label }: QuickActionProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-4 rounded-xl transition-all hover:bg-white/6 border border-white/6 hover:border-[#D7B65A]/20 group"
    >
      <div className="w-8 h-8 rounded-lg bg-[#D7B65A]/12 text-[#D7B65A] flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors font-medium">
        {label}
      </span>
    </Link>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [events, posts, gallery, projects, team] = await Promise.all([
          adminGetEventStats(),
          adminGetPostStats(),
          adminGetGalleryStats(),
          adminGetProjectStats(),
          adminGetTeamStats(),
        ]);
        setStats({ events, posts, gallery, projects, team });
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading dashboard…" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">
          Rotaract Club of Lead India Ahead — MAAYON 2026–27 CMS
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Events"
          value={stats?.events.total ?? 0}
          sub={`${stats?.events.published ?? 0} published`}
          icon={<Calendar className="w-5 h-5" />}
          to="/admin/events"
        />
        <StatCard
          label="Published Events"
          value={stats?.events.published ?? 0}
          sub={`${stats?.events.draft ?? 0} drafts`}
          icon={<TrendingUp className="w-5 h-5" />}
          to="/admin/events"
          accentColor="#34d399"
        />
        <StatCard
          label="Draft Events"
          value={stats?.events.draft ?? 0}
          sub="Pending review"
          icon={<Clock className="w-5 h-5" />}
          to="/admin/events"
          accentColor="#fbbf24"
        />
        <StatCard
          label="Posts"
          value={stats?.posts.total ?? 0}
          sub={`${stats?.posts.published ?? 0} published`}
          icon={<FileText className="w-5 h-5" />}
          to="/admin/posts"
          accentColor="#60a5fa"
        />
        <StatCard
          label="Gallery Images"
          value={stats?.gallery.total ?? 0}
          sub={`${stats?.gallery.albums ?? 0} albums`}
          icon={<Image className="w-5 h-5" />}
          to="/admin/gallery"
          accentColor="#a78bfa"
        />
        <StatCard
          label="Projects"
          value={stats?.projects.total ?? 0}
          sub={`${stats?.projects.published ?? 0} published`}
          icon={<FolderKanban className="w-5 h-5" />}
          to="/admin/projects"
          accentColor="#f472b6"
        />
        <StatCard
          label="Team Members"
          value={stats?.team.total ?? 0}
          sub={`${stats?.team.published ?? 0} published`}
          icon={<Users className="w-5 h-5" />}
          to="/admin/team"
          accentColor="#2dd4bf"
        />
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(14, 27, 48, 0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <h2 className="text-base font-semibold text-slate-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction to="/admin/events/new" icon={<Plus className="w-4 h-4" />} label="New Event" />
          <QuickAction to="/admin/posts/new" icon={<Plus className="w-4 h-4" />} label="New Post" />
          <QuickAction to="/admin/gallery" icon={<Image className="w-4 h-4" />} label="Upload Gallery" />
          <QuickAction to="/admin/settings" icon={<Users className="w-4 h-4" />} label="Edit Settings" />
        </div>
      </div>

      {/* Info Panel */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(215,182,90,0.05)',
          border: '1px solid rgba(215,182,90,0.15)',
        }}
      >
        <h2 className="text-base font-semibold text-[#D7B65A] mb-2">Getting Started</h2>
        <ul className="text-sm text-slate-400 space-y-2">
          <li>• Go to <Link to="/admin/events" className="text-[#D7B65A] hover:underline">Events</Link> to manage all club events and upload event photographs.</li>
          <li>• Use <Link to="/admin/gallery" className="text-[#D7B65A] hover:underline">Gallery</Link> to create albums (event-linked or standalone) and upload images.</li>
          <li>• Use <Link to="/admin/settings" className="text-[#D7B65A] hover:underline">Settings</Link> to update club info, social links, and contact details.</li>
          <li>• Published content appears on the public website immediately — no deployment needed.</li>
        </ul>
      </div>
    </div>
  );
}
