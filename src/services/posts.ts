import { supabase } from '../lib/supabase';
import type { Post, PaginatedResult, PaginationOptions, ContentStatus } from '../types/supabase';

export async function getPublishedPosts(): Promise<Post[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false });
  if (error) {
    console.error('[posts] getPublishedPosts error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function adminGetPosts(
  options: PaginationOptions & { status?: ContentStatus | 'all'; search?: string }
): Promise<PaginatedResult<Post>> {
  if (!supabase) throw new Error('Supabase not configured');
  const { page, pageSize, status, search } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('posts').select('*', { count: 'exact' });
  if (status && status !== 'all') query = query.eq('status', status);
  if (search) query = query.ilike('title', `%${search}%`);

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

export async function adminGetPost(id: string): Promise<Post | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminCreatePost(
  postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>
): Promise<Post> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('posts')
    .insert([postData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdatePost(
  id: string,
  updates: Partial<Omit<Post, 'id' | 'created_at'>>
): Promise<Post> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeletePost(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminPublishPost(id: string): Promise<Post> {
  return adminUpdatePost(id, {
    status: 'published',
    publish_date: new Date().toISOString().split('T')[0],
  });
}
export async function adminUnpublishPost(id: string): Promise<Post> {
  return adminUpdatePost(id, { status: 'draft' });
}
export async function adminArchivePost(id: string): Promise<Post> {
  return adminUpdatePost(id, { status: 'archived' });
}

export async function adminGetPostStats(): Promise<{
  total: number;
  published: number;
  draft: number;
}> {
  if (!supabase) return { total: 0, published: 0, draft: 0 };
  const { data } = await supabase.from('posts').select('status');
  const posts = data ?? [];
  return {
    total: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
  };
}
