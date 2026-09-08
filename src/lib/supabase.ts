import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.warn(
      '[LIA CMS] Supabase environment variables are not configured.\n' +
      'Copy .env.example to .env.local and fill in your Supabase credentials.\n' +
      'The public website will use static fallback data until Supabase is configured.'
    );
  }
}

// Create client only if credentials are available
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient<any>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export default supabase;
