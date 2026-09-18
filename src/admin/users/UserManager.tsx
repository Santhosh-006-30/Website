import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Shield, 
  RefreshCw, Lock 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile, UserRole } from '../../types/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { logAuditEvent } from '../../services/audit';
import { TableSkeleton } from '../shared/LoadingSpinner';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { showToast } from '../shared/Toast';

const ROLE_BADGES: Record<UserRole, { bg: string; text: string; border: string; label: string }> = {
  super_admin: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', label: 'Super Admin' },
  admin: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30', label: 'Admin' },
  editor: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', label: 'Editor' },
  viewer: { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/30', label: 'Viewer' },
};

export const UserManager: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pending role change confirmation
  const [pendingChange, setPendingChange] = useState<{
    profile: Profile;
    newRole: UserRole;
  } | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProfiles(data ?? []);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load user profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRoleSelect = (profile: Profile, newRole: UserRole) => {
    if (profile.role === newRole) return;
    
    // Prevent super admin self-demotion
    if (profile.id === currentUser?.id && newRole !== 'super_admin') {
      showToast.error('You cannot change your own super_admin role.');
      return;
    }

    setPendingChange({ profile, newRole });
  };

  const confirmRoleChange = async () => {
    if (!pendingChange || !supabase) return;
    const { profile, newRole } = pendingChange;
    setUpdatingId(profile.id);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      // Log the role change to the audit log
      void logAuditEvent({
        action: 'ROLE_CHANGE',
        entityType: 'profile',
        entityId: profile.id,
        entityName: profile.email,
        metadata: {
          target_user_id: profile.id,
          target_email: profile.email,
          previous_role: profile.role,
          new_role: newRole,
        },
      });

      showToast.success(`Role updated to ${newRole} for ${profile.email}`);
      setProfiles(prev =>
        prev.map(p => (p.id === profile.id ? { ...p, role: newRole } : p))
      );
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
      setPendingChange(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-cyan-400" />
            User &amp; Role Governance
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage administrative access levels and assign roles (Super Admin, Admin, Editor, Viewer).
          </p>
        </div>

        <button
          onClick={() => fetchProfiles()}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 rounded-xl text-sm font-medium transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Role explanation banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Super Admin
          </div>
          <div className="text-xs text-slate-300">
            Full control over everything, including user roles, system settings, and content.
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5">
          <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Admin
          </div>
          <div className="text-xs text-slate-300">
            Publish, edit, delete content, view audit activity. Cannot alter user roles.
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5">
          <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Editor
          </div>
          <div className="text-xs text-slate-300">
            Create, update, and publish content. Cannot delete records or access governance.
          </div>
        </div>

        <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-3.5">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Viewer
          </div>
          <div className="text-xs text-slate-300">
            Read-only access to view CMS screens and preview drafts. Cannot save changes.
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Current Role</th>
                  <th className="py-3.5 px-4 font-semibold">Created Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {profiles.map((profile) => {
                  const badge = ROLE_BADGES[profile.role] || ROLE_BADGES.viewer;
                  const isCurrent = profile.id === currentUser?.id;
                  const isUpdating = updatingId === profile.id;

                  return (
                    <tr key={profile.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-sm">
                            {(profile.full_name || profile.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-100 flex items-center gap-2">
                              {profile.full_name || profile.email}
                              {isCurrent && (
                                <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">{profile.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        {isCurrent ? (
                          <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                            <Lock className="w-3.5 h-3.5" /> Self-locked
                          </span>
                        ) : (
                          <select
                            value={profile.role}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleSelect(profile, e.target.value as UserRole)}
                            className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(pendingChange)}
        title="Confirm Role Change"
        message={`Are you sure you want to change the role of ${pendingChange?.profile.email} from "${pendingChange?.profile.role}" to "${pendingChange?.newRole}"? This action will immediately adjust their permissions.`}
        confirmLabel="Update Role"
        confirmVariant="danger"
        onConfirm={confirmRoleChange}
        onCancel={() => setPendingChange(null)}
      />
    </div>
  );
};
