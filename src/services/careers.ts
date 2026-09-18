import { supabase } from '../lib/supabase';
import type {
  Career,
  CareerFormData,
  CareerStatus,
  PaginatedResult,
  PaginationOptions,
} from '../types/supabase';
import { logAuditEvent } from './audit';

// ============================================================
// UTILITIES
// ============================================================

/**
 * Validates application URLs strictly:
 * Must start with https://
 * Prohibits dangerous protocols (javascript:, data:, vbscript:, file:, blob:, http://)
 */
export function validateApplicationUrl(url: string): { valid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { valid: false, error: 'Application URL is required.' };
  }

  const trimmed = url.trim();

  // Explicitly disallow dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return { valid: false, error: 'Dangerous protocol detected in URL.' };
  }

  // Must start with https:// (strict requirement)
  if (!lower.startsWith('https://')) {
    return { valid: false, error: 'Application URL must start with https://' };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTPS URLs are allowed.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }
}

/**
 * Generates a clean URL slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================
// PUBLIC SERVICES (Public Website)
// ============================================================

/**
 * Fetches all published, non-expired careers for the public listing.
 */
export async function getPublishedCareers(): Promise<Career[]> {
  if (!supabase) return [];

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .eq('status', 'published')
    .or(`application_deadline.is.null,application_deadline.gte.${nowIso}`)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[careers] getPublishedCareers error:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Fetches a single published, non-expired career by slug.
 */
export async function getCareerBySlug(slug: string): Promise<Career | null> {
  if (!supabase) return null;

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .or(`application_deadline.is.null,application_deadline.gte.${nowIso}`)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('[careers] getCareerBySlug error:', error.message);
    }
    return null;
  }

  return data;
}

/**
 * Fetches latest featured / published opportunities for the homepage.
 */
export async function getLatestOpportunities(limit = 3): Promise<Career[]> {
  if (!supabase) return [];

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .eq('status', 'published')
    .or(`application_deadline.is.null,application_deadline.gte.${nowIso}`)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[careers] getLatestOpportunities error:', error.message);
    return [];
  }

  return data ?? [];
}

// ============================================================
// ADMIN SERVICES (Admin CMS)
// ============================================================

export interface AdminGetCareersFilter extends PaginationOptions {
  status?: CareerStatus | 'all';
  search?: string;
  opportunityType?: string;
  workMode?: string;
}

export async function adminGetCareers(
  options: AdminGetCareersFilter
): Promise<PaginatedResult<Career>> {
  if (!supabase) throw new Error('Supabase not configured');

  const { page, pageSize, status, search, opportunityType, workMode } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('careers').select('*', { count: 'exact' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (opportunityType && opportunityType !== 'all') {
    query = query.eq('opportunity_type', opportunityType);
  }
  if (workMode && workMode !== 'all') {
    query = query.eq('work_mode', workMode);
  }
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,organization_name.ilike.%${search}%,location.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function adminGetCareer(id: string): Promise<Career | null> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function adminGetCareerBySlug(slug: string): Promise<Career | null> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
}

export async function checkSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  if (!supabase) return true;

  let query = supabase.from('careers').select('id').eq('slug', slug);
  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;
  if (error) return true;
  return (data?.length ?? 0) === 0;
}

export async function adminCreateCareer(careerData: CareerFormData): Promise<Career> {
  if (!supabase) throw new Error('Supabase not configured');

  const urlCheck = validateApplicationUrl(careerData.application_url);
  if (!urlCheck.valid) {
    throw new Error(urlCheck.error || 'Invalid application URL');
  }

  const { data, error } = await supabase
    .from('careers')
    .insert([careerData])
    .select()
    .single();

  if (error) throw new Error(error.message);

  void logAuditEvent({
    action: 'CREATE',
    entityType: 'career',
    entityId: data.id,
    entityName: data.title,
    metadata: {
      slug: data.slug,
      organization: data.organization_name,
      type: data.opportunity_type,
    },
  });

  return data;
}

export async function adminUpdateCareer(
  id: string,
  updates: Partial<CareerFormData>
): Promise<Career> {
  if (!supabase) throw new Error('Supabase not configured');

  if (updates.application_url !== undefined) {
    const urlCheck = validateApplicationUrl(updates.application_url);
    if (!urlCheck.valid) {
      throw new Error(urlCheck.error || 'Invalid application URL');
    }
  }

  const { data, error } = await supabase
    .from('careers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  void logAuditEvent({
    action: 'UPDATE',
    entityType: 'career',
    entityId: data.id,
    entityName: data.title,
    metadata: { fields: Object.keys(updates) },
  });

  return data;
}

export async function adminDeleteCareer(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase.from('careers').delete().eq('id', id);
  if (error) throw new Error(error.message);

  void logAuditEvent({
    action: 'DELETE',
    entityType: 'career',
    entityId: id,
  });
}

export async function adminPublishCareer(id: string): Promise<Career> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('careers')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'PUBLISH',
    entityType: 'career',
    entityId: id,
    entityName: data.title,
  });
  return data;
}

export async function adminUnpublishCareer(id: string): Promise<Career> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('careers')
    .update({ status: 'draft', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'UNPUBLISH',
    entityType: 'career',
    entityId: id,
    entityName: data.title,
  });
  return data;
}

export async function adminArchiveCareer(id: string): Promise<Career> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('careers')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'ARCHIVE',
    entityType: 'career',
    entityId: id,
    entityName: data.title,
  });
  return data;
}

export async function adminGetCareerStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  archived: number;
  expired: number;
}> {
  if (!supabase) return { total: 0, published: 0, draft: 0, archived: 0, expired: 0 };

  const { data, error } = await supabase
    .from('careers')
    .select('status, application_deadline');

  if (error) return { total: 0, published: 0, draft: 0, archived: 0, expired: 0 };

  const careers = data ?? [];
  const now = new Date();

  let total = 0;
  let published = 0;
  let draft = 0;
  let archived = 0;
  let expired = 0;

  for (const c of careers) {
    total++;
    if (c.status === 'published') {
      published++;
      if (c.application_deadline && new Date(c.application_deadline) < now) {
        expired++;
      }
    } else if (c.status === 'draft') {
      draft++;
    } else if (c.status === 'archived') {
      archived++;
    }
  }

  return { total, published, draft, archived, expired };
}
