import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types/supabase';
import { ROLE_LEVEL } from '../types/supabase';

// ============================================================
// ADMIN ROUTE — Phase 24
// Supports optional minRole for route-level access control.
// Role hierarchy: super_admin (4) > admin (3) > editor (2) > viewer (1)
// ============================================================

interface AdminRouteProps {
  children: React.ReactNode;
  /** Minimum role required. If omitted, any authenticated CMS user is allowed. */
  minRole?: UserRole;
}

export function AdminRoute({ children, minRole }: AdminRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#D7B65A]/30 border-t-[#D7B65A] rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying session…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ──────────────────────────────────────
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // ── Profile still loading ──────────────────────────────────
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-[#070D1A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#D7B65A]/30 border-t-[#D7B65A] rounded-full animate-spin" />
      </div>
    );
  }

  // ── Role-based access check ────────────────────────────────
  if (profile) {
    const userLevel = ROLE_LEVEL[profile.role as UserRole] ?? 0;
    const requiredLevel = minRole ? (ROLE_LEVEL[minRole] ?? 0) : 1; // 1 = viewer minimum

    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen bg-[#070D1A] flex items-center justify-center p-6">
          <div
            className="rounded-2xl p-8 max-w-md text-center w-full"
            style={{
              background: 'rgba(10, 20, 38, 0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-100 mb-2">Access Restricted</h2>
            <p className="text-slate-400 text-sm mb-1">
              This section requires <span className="text-[#D7B65A] font-medium capitalize">{minRole?.replace('_', ' ')}</span> access or higher.
            </p>
            <p className="text-slate-500 text-xs">
              Your current role: <span className="capitalize font-medium text-slate-400">{profile.role.replace('_', ' ')}</span>
            </p>
            <a
              href="/admin"
              className="mt-6 inline-block px-5 py-2 rounded-xl text-sm font-medium bg-[#D7B65A]/15 text-[#D7B65A] border border-[#D7B65A]/25 hover:bg-[#D7B65A]/25 transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export default AdminRoute;
