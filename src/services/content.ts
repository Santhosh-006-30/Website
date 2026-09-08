import { supabase } from '../lib/supabase';
import type { WebsiteContent, SiteSetting } from '../types/supabase';

// ============================================================
// WEBSITE CONTENT
// ============================================================

export async function getWebsiteContent(section: string): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from('website_content')
    .select('key, value')
    .eq('section', section);
  if (error) return {};
  const result: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.key && item.value !== null) result[item.key] = item.value;
  }
  return result;
}

export async function adminGetAllContent(): Promise<WebsiteContent[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('website_content')
    .select('*')
    .order('section', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpsertContent(
  section: string,
  key: string,
  value: string,
  valueJson?: Record<string, unknown>
): Promise<WebsiteContent> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('website_content')
    .upsert(
      {
        section,
        key,
        value,
        value_json: valueJson ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'section,key' }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteContent(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('website_content').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================
// SITE SETTINGS
// ============================================================

export async function getSiteSettings(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) return {};
  const result: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.key && item.value !== null) result[item.key] = item.value;
  }
  return result;
}

export async function adminGetAllSettings(): Promise<SiteSetting[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('key', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpsertSetting(key: string, value: string): Promise<SiteSetting> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('site_settings')
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpsertSettings(settings: Record<string, string>): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const upsertData = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from('site_settings')
    .upsert(upsertData, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}
