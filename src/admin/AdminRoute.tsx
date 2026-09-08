import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

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

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user && profile && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#070D1A] flex items-center justify-center p-6">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm">
            You do not have administrator access to this system.
          </p>
        </div>
      </div>
    );
  }

  if (user && !profile) {
    // Profile still loading — show spinner
    return (
      <div className="min-h-screen bg-[#070D1A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#D7B65A]/30 border-t-[#D7B65A] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default AdminRoute;
