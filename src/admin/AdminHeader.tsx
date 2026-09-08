import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { MobileMenuButton } from './AdminSidebar';
import { useAuth } from '../contexts/AuthContext';

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
  '/admin/gallery': 'Gallery',
  '/admin/team': 'Leadership',
  '/admin/content': 'Website Content',
  '/admin/settings': 'Settings',
};

function getBreadcrumbs(pathname: string): { label: string; to: string }[] {
  const crumbs: { label: string; to: string }[] = [
    { label: 'Admin', to: '/admin' },
  ];

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
  const { profile } = useAuth();
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
        {/* View public site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#D7B65A] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Public Site
        </a>

        {/* User avatar */}
        {profile && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#D7B65A] flex-shrink-0"
            style={{
              background: 'rgba(215,182,90,0.15)',
              border: '1px solid rgba(215,182,90,0.3)',
            }}
            title={profile.email}
          >
            {(profile.full_name ?? profile.email)?.[0]?.toUpperCase() ?? 'A'}
          </div>
        )}
      </div>
    </header>
  );
}
