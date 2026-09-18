import React, { useState } from 'react';
import { 
  User, Shield, Lock, Save, Key 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { logAuditEvent } from '../../services/audit';
import { showToast } from '../shared/Toast';

export const ProfilePage: React.FC = () => {
  const { user, profile, role } = useAuth();
  
  // Profile info state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      void logAuditEvent({
        action: 'UPDATE',
        entityType: 'profile',
        entityId: user.id,
        entityName: user.email,
        metadata: { full_name: fullName.trim() },
      });

      showToast.success('Profile details updated successfully');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (newPassword.length < 6) {
      showToast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      void logAuditEvent({
        action: 'UPDATE',
        entityType: 'profile',
        entityId: user?.id,
        entityName: user?.email,
        metadata: { action: 'password_reset' },
      });

      showToast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <User className="w-7 h-7 text-cyan-400" />
          Admin Profile &amp; Security
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal administrative identity, display name, and password credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-3xl font-black text-cyan-300 shadow-xl mb-4">
              {(profile?.full_name || user?.email || 'A')[0].toUpperCase()}
            </div>

            <h3 className="text-lg font-bold text-slate-100">
              {profile?.full_name || 'Administrator'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5 break-all">
              {user?.email}
            </p>

            <div className="mt-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                role === 'super_admin'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : role === 'admin'
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : role === 'editor'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
              }`}>
                <Shield className="w-3.5 h-3.5" />
                {role?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="w-full border-t border-slate-800 mt-6 pt-4 text-left text-xs space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Account ID:</span>
                <span className="font-mono text-slate-300">{user?.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-slate-300">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Display Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. RAC LIA Team"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address (Primary Login)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-800/40 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Email is managed via Supabase Auth and cannot be modified here.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Change Password
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword || !newPassword}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-100 font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 text-cyan-400" />
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
