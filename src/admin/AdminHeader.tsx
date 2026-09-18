import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, Shield, Search } from 'lucide-react';
import { MobileMenuButton } from './AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { GlobalSearchModal } from './shared/GlobalSearchModal';

interface AdminHeaderProps {
  onMobileMenuOpen: () => void;
}

// Map route paths to breadcrumb labels
const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/events': 'Events',
  '/admin/events/new': 'New Event',
  '/admin/posts': 'Posts',
  '/admin/posts/new': 'New Post',
  '/admin/projects': 'Projects',
  '/admin/projects/new': 'New Project',
  '/admin/careers': 'Careers',
  '/admin/careers/new': 'New Opportunity',
  '/admin/gallery': 'Gallery',
  '/admin/team': 'Leadership',
  '/admin/content': 'Website Content',
  '/admin/settings': 'Settings',
  '/admin/activity': 'Activity Log',
  '/admin/users': 'User Governance',
  '/admin/profile': 'Admin Profile',
};

function getBreadcrumbs(pathname: string): { label: string; to: string }[] {
  const crumbs: { label: string; to: string }[] = [
    { label: 'Admin', to: '/admin' },
  ];

  if (pathname.includes('/admin/preview/')) {
    crumbs.push({ label: 'Preview', to: pathname });
    return crumbs;
  }

  const segments = pathname.split('/').filter(Boolean);
  let path = '';

  for (const segment of segments) {
    path += `/${segment}`;
    const label = BREADCRUMB_MAP[path];
    if (label && path !== '/admin') {
      crumbs.push({ label, to: path });
    } else if (!label && segment !== 'admin') {
      // Dynamic segment like an ID
      crumbs.push({ label: 'Edit', to: path });
    }
  }

  return crumbs;
}

export function AdminHeader({ onMobileMenuOpen }: AdminHeaderProps) {
  const location = useLocation();
  const { profile, role } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header
      className="h-14 flex items-center px-4 flex-shrink-0 gap-4"
      style={{
        background: 'rgba(7, 17, 31, 0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Mobile menu button */}
      <MobileMenuButton onClick={onMobileMenuOpen} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 flex-1 overflow-hidden">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.to} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-slate-200 truncate">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.to}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Global Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Search CMS (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#D7B65A]" />
          <span className="hidden md:inline">Search CMS...</span>
          <kbd className="hidden lg:inline-block text-[9px] bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* View public site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#D7B65A] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Public Site
        </a>

        {/* Role badge */}
        {role && (
          <span
            className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
              role === 'super_admin'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : role === 'admin'
                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                : role === 'editor'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
            }`}
          >
            <Shield className="w-3 h-3" />
            {role.replace('_', ' ')}
          </span>
        )}

        {/* User avatar linking to Profile */}
        {profile && (
          <Link
            to="/admin/profile"
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#D7B65A] hover:scale-105 transition-transform flex-shrink-0"
            style={{
              background: 'rgba(215,182,90,0.15)',
              border: '1px solid rgba(215,182,90,0.3)',
            }}
            title={`${profile.full_name || profile.email} (View Profile)`}
          >
            {(profile.full_name ?? profile.email)?.[0]?.toUpperCase() ?? 'A'}
          </Link>
        )}
      </div>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
