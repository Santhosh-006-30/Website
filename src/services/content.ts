import { supabase } from '../lib/supabase';
import type { WebsiteContent, SiteSetting } from '../types/supabase';
import type { ClubInfo } from '../types';
import { CLUB_INFO } from '../data/club';
import { logAuditEvent } from './audit';

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
  void logAuditEvent({
    action: 'UPDATE',
    entityType: 'site_setting',
    entityId: key,
    entityName: `Site Setting: ${key}`,
  });
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
  void logAuditEvent({
    action: 'UPDATE',
    entityType: 'site_setting',
    entityId: 'global',
    entityName: 'Global Site Settings',
    metadata: { keysCount: Object.keys(settings).length },
  });
}

/**
 * Fetch club info from CMS site_settings with fallback to verified static data.
 * Guarantees the site never breaks or displays blank if the database is unreachable.
 */
export async function getMergedClubInfo(): Promise<ClubInfo> {
  try {
    const settings = await getSiteSettings();
    if (!settings || Object.keys(settings).length === 0) {
      return CLUB_INFO;
    }

    return {
      clubName: settings.club_name || CLUB_INFO.clubName,
      shortName: settings.short_name || CLUB_INFO.shortName,
      established: Number(settings.established) || CLUB_INFO.established,
      district: settings.district || CLUB_INFO.district,
      clubId: settings.club_id || CLUB_INFO.clubId,
      group: CLUB_INFO.group,
      zone: CLUB_INFO.zone,
      location: settings.location || CLUB_INFO.location,
      sponsorClub: settings.sponsor_club || CLUB_INFO.sponsorClub,
      rotaryYear: settings.rotary_year || CLUB_INFO.rotaryYear,
      currentTheme: settings.current_theme || CLUB_INFO.currentTheme,
      themeStatementPlaceholder: CLUB_INFO.themeStatementPlaceholder,
      president: {
        name: settings.president_name || CLUB_INFO.president.name,
        title: settings.president_title || CLUB_INFO.president.title,
        term: settings.president_term || CLUB_INFO.president.term,
      },
      contact: {
        phones: settings.phone_primary
          ? [settings.phone_primary, settings.phone_secondary || ''].filter(Boolean)
          : CLUB_INFO.contact.phones,
        email: settings.email || CLUB_INFO.contact.email,
        instagram: settings.instagram_handle || CLUB_INFO.contact.instagram,
        instagramUrl: settings.instagram_url || CLUB_INFO.contact.instagramUrl,
        linkedin: CLUB_INFO.contact.linkedin,
        linkedinUrl: settings.linkedin_url || CLUB_INFO.contact.linkedinUrl,
        address: settings.address || CLUB_INFO.contact.address,
      },
      links: CLUB_INFO.links,
    };
  } catch (err) {
    console.warn('[content] getMergedClubInfo error, using static fallback:', err);
    return CLUB_INFO;
  }
}
