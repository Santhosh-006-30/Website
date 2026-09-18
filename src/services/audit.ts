import { supabase } from '../lib/supabase';
import type { AuditLog, AuditAction, AuditEntityType, PaginatedResult } from '../types/supabase';

// ============================================================
// AUDIT LOG SERVICE
// Phase 24 — Append-only activity tracking
// Never stores: passwords, tokens, secrets.
// ============================================================

export interface LogAuditOptions {
  action: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  entityName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Append a single audit event. Called internally by other services.
 * Failures are swallowed silently — audit logging must never break the
 * primary operation.
 */
export async function logAuditEvent(options: LogAuditOptions): Promise<void> {
  if (!supabase) return;

  try {
    // Get current session for user context
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; // Only log for authenticated sessions

    // Fetch profile for display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', session.user.id)
      .single();

    const { error } = await supabase.from('audit_logs').insert([{
      user_id: session.user.id,
      user_email: profile?.email ?? session.user.email ?? null,
      user_name: profile?.full_name ?? null,
      action: options.action,
      entity_type: options.entityType ?? null,
      entity_id: options.entityId ?? null,
      entity_name: options.entityName ?? null,
      metadata: options.metadata ?? {},
    }]);

    if (error) {
      // Log to console but never throw — audit failure must not break operations
      console.warn('[audit] Failed to log event:', error.message);
    }
  } catch (err) {
    console.warn('[audit] Unexpected error:', err);
  }
}

// ============================================================
// QUERY AUDIT LOGS (admin/super_admin only via RLS)
// ============================================================

export interface GetAuditLogsOptions {
  page?: number;
  pageSize?: number;
  action?: AuditAction;
  entityType?: AuditEntityType;
  userId?: string;
  dateFrom?: string; // ISO date string
  dateTo?: string;   // ISO date string
}

export async function getAuditLogs(
  options: GetAuditLogsOptions = {}
): Promise<PaginatedResult<AuditLog>> {
  if (!supabase) throw new Error('Supabase not configured');

  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' });

  if (options.action) {
    query = query.eq('action', options.action);
  }
  if (options.entityType) {
    query = query.eq('entity_type', options.entityType);
  }
  if (options.userId) {
    query = query.eq('user_id', options.userId);
  }
  if (options.dateFrom) {
    query = query.gte('created_at', options.dateFrom);
  }
  if (options.dateTo) {
    // Add one day to include the entire end date
    const end = new Date(options.dateTo);
    end.setDate(end.getDate() + 1);
    query = query.lt('created_at', end.toISOString());
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as AuditLog[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * Fetch only the most recent N audit log entries for the dashboard.
 */
export async function getRecentActivity(limit = 8): Promise<AuditLog[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[audit] getRecentActivity error:', error.message);
      return [];
    }
    return (data ?? []) as AuditLog[];
  } catch {
    return [];
  }
}
