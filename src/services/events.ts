import { supabase } from '../lib/supabase';
import type { Event, EventImage, PaginatedResult, PaginationOptions, ContentStatus } from '../types/supabase';
import { logAuditEvent } from './audit';

// ============================================================
// PUBLIC SERVICE — used by public website components
// ============================================================

export async function getPublishedEvents(): Promise<Event[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: false });

  if (error) {
    console.error('[events] getPublishedEvents error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getPublishedEventImages(eventId: string): Promise<EventImage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('event_images')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[events] getPublishedEventImages error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getPublishedEventBySlug(slug: string): Promise<Event | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('[events] getPublishedEventBySlug error:', error.message);
    return null;
  }
  return data;
}

// ============================================================
// ADMIN SERVICE — used by admin CMS components
// ============================================================

export async function adminGetEvents(
  options: PaginationOptions & { status?: ContentStatus | 'all'; search?: string }
): Promise<PaginatedResult<Event>> {
  if (!supabase) throw new Error('Supabase not configured');

  const { page, pageSize, status, search } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('events').select('*', { count: 'exact' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.ilike('title', `%${search}%`);
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

export async function adminGetEvent(id: string): Promise<Event | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminGetEventBySlug(slug: string): Promise<Event | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
}

export async function adminCreateEvent(
  eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>
): Promise<Event> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'CREATE',
    entityType: 'event',
    entityId: data.id,
    entityName: data.title,
    metadata: { slug: data.slug, category: data.category },
  });
  return data;
}

export async function adminUpdateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'created_at'>>
): Promise<Event> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'UPDATE',
    entityType: 'event',
    entityId: data.id,
    entityName: data.title,
    metadata: { fields: Object.keys(updates) },
  });
  return data;
}

export async function adminDeleteEvent(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'DELETE',
    entityType: 'event',
    entityId: id,
  });
}

export async function adminPublishEvent(id: string): Promise<Event> {
  const result = await adminUpdateEvent(id, { status: 'published' });
  void logAuditEvent({
    action: 'PUBLISH',
    entityType: 'event',
    entityId: id,
    entityName: result.title,
  });
  return result;
}

export async function adminUnpublishEvent(id: string): Promise<Event> {
  const result = await adminUpdateEvent(id, { status: 'draft' });
  void logAuditEvent({
    action: 'UNPUBLISH',
    entityType: 'event',
    entityId: id,
    entityName: result.title,
  });
  return result;
}

export async function adminArchiveEvent(id: string): Promise<Event> {
  const result = await adminUpdateEvent(id, { status: 'archived' });
  void logAuditEvent({
    action: 'ARCHIVE',
    entityType: 'event',
    entityId: id,
    entityName: result.title,
  });
  return result;
}

// EVENT IMAGES
export async function adminGetEventImages(eventId: string): Promise<EventImage[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('event_images')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminAddEventImage(
  imageData: Omit<EventImage, 'id' | 'created_at'>
): Promise<EventImage> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('event_images')
    .insert([imageData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'UPLOAD',
    entityType: 'event',
    entityId: data.event_id,
    metadata: { image_id: data.id, image_url: data.image_url },
  });
  return data;
}

export async function adminUpdateEventImage(
  id: string,
  updates: Partial<Omit<EventImage, 'id' | 'created_at'>>
): Promise<EventImage> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('event_images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteEventImage(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('event_images').delete().eq('id', id);
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'DELETE_IMAGE',
    entityType: 'event',
    metadata: { image_id: id },
  });
}

export async function adminSetCoverImage(eventId: string, imageId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  // Unset all cover images for this event
  await supabase.from('event_images').update({ is_cover: false }).eq('event_id', eventId);
  // Set the new cover
  const { error } = await supabase
    .from('event_images')
    .update({ is_cover: true })
    .eq('id', imageId);
  if (error) throw new Error(error.message);
}

export async function adminReorderEventImages(
  images: { id: string; sort_order: number }[]
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  for (const img of images) {
    await supabase
      .from('event_images')
      .update({ sort_order: img.sort_order })
      .eq('id', img.id);
  }
}

export async function adminGetEventStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  archived: number;
}> {
  if (!supabase) return { total: 0, published: 0, draft: 0, archived: 0 };
  const { data, error } = await supabase.from('events').select('status');
  if (error) return { total: 0, published: 0, draft: 0, archived: 0 };
  const events = data ?? [];
  return {
    total: events.length,
    published: events.filter((e) => e.status === 'published').length,
    draft: events.filter((e) => e.status === 'draft').length,
    archived: events.filter((e) => e.status === 'archived').length,
  };
}
