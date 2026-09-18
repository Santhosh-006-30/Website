import { supabase } from '../lib/supabase';
import type { TeamMember, PaginatedResult, PaginationOptions } from '../types/supabase';
import { logAuditEvent } from './audit';

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('[team] getPublishedTeamMembers error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function adminGetTeamMembers(
  options: PaginationOptions & { search?: string }
): Promise<PaginatedResult<TeamMember>> {
  if (!supabase) throw new Error('Supabase not configured');
  const { page, pageSize, search } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('team_members').select('*', { count: 'exact' });
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query
    .order('display_order', { ascending: true })
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

export async function adminGetTeamMember(id: string): Promise<TeamMember | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminCreateTeamMember(
  memberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>
): Promise<TeamMember> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('team_members')
    .insert([memberData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'CREATE',
    entityType: 'team_member',
    entityId: data.id,
    entityName: data.name,
    metadata: { designation: data.designation },
  });
  return data;
}

export async function adminUpdateTeamMember(
  id: string,
  updates: Partial<Omit<TeamMember, 'id' | 'created_at'>>
): Promise<TeamMember> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('team_members')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'UPDATE',
    entityType: 'team_member',
    entityId: data.id,
    entityName: data.name,
    metadata: { fields: Object.keys(updates) },
  });
  return data;
}

export async function adminDeleteTeamMember(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'DELETE',
    entityType: 'team_member',
    entityId: id,
  });
}

export async function adminReorderTeamMembers(
  members: { id: string; display_order: number }[]
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  for (const member of members) {
    await supabase
      .from('team_members')
      .update({ display_order: member.display_order })
      .eq('id', member.id);
  }
}

export async function adminGetTeamStats(): Promise<{
  total: number;
  published: number;
}> {
  if (!supabase) return { total: 0, published: 0 };
  const { data, error } = await supabase.from('team_members').select('published');
  if (error) return { total: 0, published: 0 };
  const members = data ?? [];
  return {
    total: members.length,
    published: members.filter((m) => m.published).length,
  };
}

