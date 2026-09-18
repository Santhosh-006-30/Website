import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, FileText, FolderKanban, Image, Users, Plus,
  TrendingUp, ArrowRight, Activity, ShieldCheck,
  Sparkles, Briefcase
} from 'lucide-react';
import { adminGetEventStats } from '../services/events';
import { adminGetPostStats } from '../services/posts';
import { adminGetGalleryStats } from '../services/gallery';
import { adminGetProjectStats } from '../services/projects';
import { adminGetTeamStats } from '../services/team';
import { adminGetCareerStats } from '../services/careers';
import { adminGetUserStats, type UserStats } from '../services/users';
import { getRecentActivity } from '../services/audit';
import type { AuditLog } from '../types/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './shared/LoadingSpinner';

interface DashboardStats {
  events: { total: number; published: number; draft: number; archived: number } | null;
  posts: { total: number; published: number; draft: number } | null;
  gallery: { total: number; albums: number } | null;
  projects: { total: number; published: number; featured: number } | null;
  team: { total: number; published: number } | null;
  careers: { total: number; published: number; draft: number; archived: number; expired: number } | null;
  users: UserStats | null;
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
  const { role, isSuperAdmin, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [events, posts, gallery, projects, team, careers, users, logs] = await Promise.all([
          adminGetEventStats().catch(() => null),
          adminGetPostStats().catch(() => null),
          adminGetGalleryStats().catch(() => null),
          adminGetProjectStats().catch(() => null),
          adminGetTeamStats().catch(() => null),
          adminGetCareerStats().catch(() => null),
          adminGetUserStats().catch(() => null),
          getRecentActivity(6).catch(() => []),
        ]);
        setStats({ events, posts, gallery, projects, team, careers, users });
        setRecentLogs(logs);
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
      {/* Welcome & Role Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1 flex items-center gap-2.5">
            Dashboard V3
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
              Governance CMS
            </span>
          </h1>
          <p className="text-slate-400 text-sm">
            Rotaract Club of Lead India Ahead — Professional Content Governance &amp; Administration
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
            role === 'super_admin'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : role === 'admin'
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              : role === 'editor'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {role?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Events"
          value={stats?.events ? stats.events.total : 'Unavailable'}
          sub={stats?.events ? `${stats.events.published} live • ${stats.events.archived} archived` : 'Database unavailable'}
          icon={<Calendar className="w-5 h-5" />}
          to="/admin/events"
        />
        <StatCard
          label="Published Events"
          value={stats?.events ? stats.events.published : 'Unavailable'}
          sub={stats?.events ? 'Live on public website' : 'Database unavailable'}
          icon={<TrendingUp className="w-5 h-5" />}
          to="/admin/events"
          accentColor="#34d399"
        />
        <StatCard
          label="Articles / Posts"
          value={stats?.posts ? stats.posts.total : 'Unavailable'}
          sub={stats?.posts ? `${stats.posts.published} published` : 'Database unavailable'}
          icon={<FileText className="w-5 h-5" />}
          to="/admin/posts"
          accentColor="#60a5fa"
        />
        <StatCard
          label="Gallery Images"
          value={stats?.gallery ? stats.gallery.total : 'Unavailable'}
          sub={stats?.gallery ? `${stats.gallery.albums} photo albums` : 'Database unavailable'}
          icon={<Image className="w-5 h-5" />}
          to="/admin/gallery"
          accentColor="#a78bfa"
        />
        <StatCard
          label="Initiatives & Projects"
          value={stats?.projects ? stats.projects.total : 'Unavailable'}
          sub={stats?.projects ? `${stats.projects.featured} flagship` : 'Database unavailable'}
          icon={<FolderKanban className="w-5 h-5" />}
          to="/admin/projects"
          accentColor="#f472b6"
        />
        <StatCard
          label="Team Directory"
          value={stats?.team ? stats.team.total : 'Unavailable'}
          sub={stats?.team ? `${stats.team.published} published` : 'Database unavailable'}
          icon={<Users className="w-5 h-5" />}
          to="/admin/team"
          accentColor="#2dd4bf"
        />
        <StatCard
          label="Careers & Opps"
          value={stats?.careers ? stats.careers.total : 'Unavailable'}
          sub={stats?.careers ? `${stats.careers.published} live • ${stats.careers.expired} expired` : 'Database unavailable'}
          icon={<Briefcase className="w-5 h-5" />}
          to="/admin/careers"
          accentColor="#38bdf8"
        />
        <StatCard
          label="User Accounts"
          value={stats?.users ? stats.users.total : 'Unavailable'}
          sub={stats?.users ? `${stats.users.superAdmins + stats.users.admins} admins • ${stats.users.editors} editors` : 'Governance unavailable'}
          icon={<ShieldCheck className="w-5 h-5" />}
          to="/admin/users"
          accentColor="#fbbf24"
        />
      </div>

      {/* Grid: Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions (1 Col) */}
        <div
          className="rounded-2xl p-6 flex flex-col justify-between"
          style={{
            background: 'rgba(14, 27, 48, 0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div>
            <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D7B65A]" />
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              <QuickAction to="/admin/events/new" icon={<Plus className="w-4 h-4" />} label="Create Event" />
              <QuickAction to="/admin/careers/new" icon={<Plus className="w-4 h-4" />} label="Post Opportunity" />
              <QuickAction to="/admin/posts/new" icon={<Plus className="w-4 h-4" />} label="Write New Post" />
              <QuickAction to="/admin/gallery" icon={<Image className="w-4 h-4" />} label="Upload Gallery Photos" />
              {isAdmin && (
                <QuickAction to="/admin/activity" icon={<Activity className="w-4 h-4" />} label="View Activity Log" />
              )}
              {isSuperAdmin && (
                <QuickAction to="/admin/users" icon={<Users className="w-4 h-4" />} label="Manage Roles & Access" />
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            Current Session: <span className="text-slate-200 font-medium">{role}</span>
          </div>
        </div>

        {/* Recent Activity Feed (2 Cols) */}
        <div
          className="lg:col-span-2 rounded-2xl p-6"
          style={{
            background: 'rgba(14, 27, 48, 0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Recent Administrative Activity
            </h2>
            {isAdmin && (
              <Link
                to="/admin/activity"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No recent activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      log.action === 'CREATE' || log.action === 'PUBLISH'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : log.action === 'UPDATE' || log.action === 'UPLOAD'
                        ? 'bg-blue-500/15 text-blue-300'
                        : log.action === 'DELETE' || log.action === 'DELETE_IMAGE'
                        ? 'bg-rose-500/15 text-rose-300'
                        : log.action === 'ROLE_CHANGE'
                        ? 'bg-purple-500/15 text-purple-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {log.action}
                    </span>
                    <div className="truncate">
                      <span className="text-slate-200 font-medium truncate block">
                        {log.entity_name || log.entity_type || 'System Event'}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        by {log.user_name || log.user_email || 'System'}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-500 shrink-0 font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Governance & Publication Notice */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(215,182,90,0.05)',
          border: '1px solid rgba(215,182,90,0.15)',
        }}
      >
        <h2 className="text-base font-semibold text-[#D7B65A] mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D7B65A]" />
          CMS V2 Governance &amp; Publishing Rules
        </h2>
        <ul className="text-sm text-slate-400 space-y-2">
          <li>• <strong className="text-slate-200">Role-Based Access:</strong> Only Super Admins can alter user roles. Editors can draft and publish content but cannot delete records.</li>
          <li>• <strong className="text-slate-200">Draft Preview:</strong> You can preview unpublished drafts with complete public styling before making them visible.</li>
          <li>• <strong className="text-slate-200">Audit Logging:</strong> All administrative modifications are permanently tracked in the audit trail.</li>
          <li>• <strong className="text-slate-200">Live Website Sync:</strong> Changes to published items update on the public website immediately.</li>
        </ul>
      </div>
    </div>
  );
}
