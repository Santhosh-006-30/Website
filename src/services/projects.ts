import { supabase } from '../lib/supabase';
import type { Project, ProjectImage, PaginatedResult, PaginationOptions } from '../types/supabase';

export async function getPublishedProjects(): Promise<Project[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('year', { ascending: false });
  if (error) {
    console.error('[projects] getPublishedProjects error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getPublishedFeaturedProjects(): Promise<Project[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('year', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function adminGetProjects(
  options: PaginationOptions & { status?: string; search?: string }
): Promise<PaginatedResult<Project>> {
  if (!supabase) throw new Error('Supabase not configured');
  const { page, pageSize, status, search } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('projects').select('*', { count: 'exact' });
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

export async function adminGetProject(id: string): Promise<Project | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminCreateProject(
  projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>
): Promise<Project> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'created_at'>>
): Promise<Project> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteProject(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminPublishProject(id: string): Promise<Project> {
  return adminUpdateProject(id, { status: 'published' });
}
export async function adminArchiveProject(id: string): Promise<Project> {
  return adminUpdateProject(id, { status: 'archived' });
}

export async function adminGetProjectImages(projectId: string): Promise<ProjectImage[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminAddProjectImage(
  imageData: Omit<ProjectImage, 'id' | 'created_at'>
): Promise<ProjectImage> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('project_images')
    .insert([imageData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteProjectImage(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('project_images').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function adminGetProjectStats(): Promise<{
  total: number;
  published: number;
  featured: number;
}> {
  if (!supabase) return { total: 0, published: 0, featured: 0 };
  const { data, error } = await supabase.from('projects').select('status, featured');
  if (error) return { total: 0, published: 0, featured: 0 };
  const projects = data ?? [];
  return {
    total: projects.length,
    published: projects.filter((p) => p.status === 'published').length,
    featured: projects.filter((p) => p.featured).length,
  };
}

