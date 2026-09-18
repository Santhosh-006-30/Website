import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types/supabase';
import { logAuditEvent } from '../services/audit';

// ============================================================
// CONTEXT TYPES
// ============================================================

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  // Role helpers
  role: UserRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;   // true for admin OR super_admin
  isEditor: boolean;
  isViewer: boolean;
  canWrite: boolean;  // true for super_admin, admin, editor
  canDelete: boolean; // true for super_admin, admin only
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) return null;
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profileError) {
        console.error('[auth] Profile fetch error:', profileError.message);
        return null;
      }
      return data as Profile;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Restore existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured. Please add environment variables.');
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      // Never reveal whether the email exists
      throw new Error('Invalid email or password. Please try again.');
    }

    if (!data.user) {
      setLoading(false);
      throw new Error('Authentication failed. Please try again.');
    }

    const prof = await fetchProfile(data.user.id);

    // All four roles (super_admin, admin, editor, viewer) may access the CMS.
    // There is no role-based login rejection — authorization happens per-route/per-action.
    if (!prof) {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setLoading(false);
      throw new Error('Your account profile could not be loaded. Contact the administrator.');
    }

    setUser(data.user);
    setProfile(prof);
    setLoading(false);

    // Log LOGIN audit event (best-effort, after state is set)
    void logAuditEvent({
      action: 'LOGIN',
      entityType: 'session',
      entityName: prof.email,
      metadata: { role: prof.role },
    });
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    if (!supabase) return;

    // Log LOGOUT before session is destroyed
    void logAuditEvent({
      action: 'LOGOUT',
      entityType: 'session',
      entityName: profile?.email ?? undefined,
    });

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [profile]);

  // ── Computed role booleans ──────────────────────────────────
  const role = (profile?.role as UserRole) ?? null;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'super_admin' || role === 'admin';
  const isEditor = role === 'editor';
  const isViewer = role === 'viewer';
  const canWrite = role === 'super_admin' || role === 'admin' || role === 'editor';
  const canDelete = role === 'super_admin' || role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role,
        isSuperAdmin,
        isAdmin,
        isEditor,
        isViewer,
        canWrite,
        canDelete,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
