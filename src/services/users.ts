import { supabase } from '../lib/supabase';
import type { Profile } from '../types/supabase';

export interface UserStats {
  total: number;
  superAdmins: number;
  admins: number;
  editors: number;
  viewers: number;
}

/**
 * Fetch aggregate statistics about registered CMS users.
 * Returns null if the profiles table cannot be accessed or RLS denies access.
 */
export async function adminGetUserStats(): Promise<UserStats | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role');

    if (error) {
      console.warn('[users] adminGetUserStats error:', error.message);
      return null;
    }

    const profiles = data ?? [];
    let superAdmins = 0;
    let admins = 0;
    let editors = 0;
    let viewers = 0;

    for (const p of profiles) {
      if (p.role === 'super_admin') superAdmins++;
      else if (p.role === 'admin') admins++;
      else if (p.role === 'editor') editors++;
      else if (p.role === 'viewer') viewers++;
    }

    return {
      total: profiles.length,
      superAdmins,
      admins,
      editors,
      viewers,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch all user profiles (respects RLS, for admin/super_admin governance).
 */
export async function adminGetProfiles(): Promise<Profile[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[users] adminGetProfiles error:', error.message);
      return null;
    }

    return data ?? [];
  } catch {
    return null;
  }
}
