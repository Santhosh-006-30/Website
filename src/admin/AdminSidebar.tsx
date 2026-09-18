import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, FileText, FolderKanban, Image,
  Users, Globe, Settings, LogOut, ChevronLeft, ChevronRight,
  Shield, Menu, X, Activity, UserCog, User, Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

interface SidebarContentProps {
  collapsed: boolean;
  onLogout: () => void;
}

function SidebarContent({ collapsed, onLogout }: SidebarContentProps) {
  const { profile, isAdmin, isSuperAdmin, role } = useAuth();

  const navItems: NavItem[] = [
    { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', end: true },
    { to: '/admin/events', icon: <Calendar className="w-5 h-5" />, label: 'Events' },
    { to: '/admin/posts', icon: <FileText className="w-5 h-5" />, label: 'Posts' },
    { to: '/admin/projects', icon: <FolderKanban className="w-5 h-5" />, label: 'Projects' },
    { to: '/admin/careers', icon: <Briefcase className="w-5 h-5" />, label: 'Careers' },
    { to: '/admin/gallery', icon: <Image className="w-5 h-5" />, label: 'Gallery' },
    { to: '/admin/team', icon: <Users className="w-5 h-5" />, label: 'Leadership' },
    { to: '/admin/content', icon: <Globe className="w-5 h-5" />, label: 'Website Content' },
    { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  if (isAdmin) {
    navItems.push({
      to: '/admin/activity',
      icon: <Activity className="w-5 h-5" />,
      label: 'Activity Log',
    });
  }

  if (isSuperAdmin) {
    navItems.push({
      to: '/admin/users',
      icon: <UserCog className="w-5 h-5" />,
      label: 'User Governance',
    });
  }

  navItems.push({
    to: '/admin/profile',
    icon: <User className="w-5 h-5" />,
    label: 'Profile',
  });

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(215,182,90,0.25) 0%, rgba(184,150,53,0.1) 100%)',
              border: '1px solid rgba(215,182,90,0.3)',
            }}
          >
            <Shield className="w-5 h-5 text-[#D7B65A]" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-100 whitespace-nowrap">LIA Admin</p>
              <p className="text-xs text-slate-500 whitespace-nowrap">MAAYON 2026–27</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-[#D7B65A]/15 text-[#D7B65A] border border-[#D7B65A]/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/6'
              }`
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Role + Logout */}
      <div className="border-t border-white/8 p-3 flex-shrink-0 space-y-1">
        {!collapsed && profile && (
          <NavLink
            to="/admin/profile"
            className="block px-3 py-2 mb-1 rounded-xl hover:bg-white/6 transition-colors"
          >
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-xs text-slate-400 truncate font-medium">
                {profile.full_name || 'Admin'}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase ${
                role === 'super_admin'
                  ? 'bg-amber-500/20 text-amber-300'
                  : role === 'admin'
                  ? 'bg-blue-500/20 text-blue-300'
                  : role === 'editor'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {role === 'super_admin' ? 'SUPER' : role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate font-mono">{profile.email}</p>
          </NavLink>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MOBILE DRAWER
// ============================================================

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

function MobileDrawer({ isOpen, onClose, onLogout }: MobileDrawerProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          style={{ backdropFilter: 'blur(3px)' }}
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:hidden transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(7, 17, 31, 0.98)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/8 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent collapsed={false} onLogout={onLogout} />
      </div>
    </>
  );
}

// ============================================================
// MAIN SIDEBAR
// ============================================================

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login', { replace: true });
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
        style={{
          background: 'rgba(7, 17, 31, 0.95)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <SidebarContent collapsed={collapsed} onLogout={handleLogout} />

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-[#0F1E35] border border-white/15 text-slate-400 hover:text-[#D7B65A] flex items-center justify-center transition-colors shadow-lg"
          style={{ position: 'sticky', bottom: '80px', marginLeft: 'auto', marginRight: '-12px' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileOpen}
        onClose={onMobileClose}
        onLogout={handleLogout}
      />
    </>
  );
}

// ============================================================
// MOBILE MENU BUTTON (exported for AdminHeader)
// ============================================================
interface MobileMenuButtonProps {
  onClick: () => void;
}
export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-white/8 rounded-xl transition-colors"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
