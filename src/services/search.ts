import { supabase } from '../lib/supabase';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  type: 'event' | 'project' | 'post' | 'career' | 'team' | 'gallery';
  adminUrl: string;
  publicUrl?: string;
}

export interface GroupedSearchResults {
  events: SearchResultItem[];
  projects: SearchResultItem[];
  posts: SearchResultItem[];
  careers: SearchResultItem[];
  team: SearchResultItem[];
  gallery: SearchResultItem[];
  totalResults: number;
}

/**
 * Global search across CMS resources.
 * Executes queries against Supabase tables and formats results for admin navigation.
 * Never throws — returns empty results if a table is inaccessible.
 */
export async function adminGlobalSearch(query: string): Promise<GroupedSearchResults> {
  const emptyResult: GroupedSearchResults = {
    events: [],
    projects: [],
    posts: [],
    careers: [],
    team: [],
    gallery: [],
    totalResults: 0,
  };

  const q = query.trim();
  if (!supabase || !q) return emptyResult;

  try {
    const [eventsRes, projectsRes, postsRes, careersRes, teamRes, galleryRes] =
      await Promise.allSettled([
        supabase
          .from('events')
          .select('id, title, category, status')
          .ilike('title', `%${q}%`)
          .limit(4),
        supabase
          .from('projects')
          .select('id, title, category, status')
          .ilike('title', `%${q}%`)
          .limit(4),
        supabase
          .from('posts')
          .select('id, title, category, status')
          .ilike('title', `%${q}%`)
          .limit(4),
        supabase
          .from('careers')
          .select('id, title, category, status')
          .ilike('title', `%${q}%`)
          .limit(4),
        supabase
          .from('team_members')
          .select('id, name, designation')
          .ilike('name', `%${q}%`)
          .limit(4),
        supabase
          .from('gallery_albums')
          .select('id, name, description')
          .ilike('name', `%${q}%`)
          .limit(4),
      ]);

    const events: SearchResultItem[] =
      eventsRes.status === 'fulfilled' && eventsRes.value.data
        ? eventsRes.value.data.map((e) => ({
            id: e.id,
            title: e.title,
            subtitle: `Status: ${e.status}`,
            category: e.category,
            type: 'event',
            adminUrl: `/admin/events/${e.id}/edit`,
            publicUrl: `/events`,
          }))
        : [];

    const projects: SearchResultItem[] =
      projectsRes.status === 'fulfilled' && projectsRes.value.data
        ? projectsRes.value.data.map((p) => ({
            id: p.id,
            title: p.title,
            subtitle: `Status: ${p.status}`,
            category: p.category,
            type: 'project',
            adminUrl: `/admin/projects/${p.id}/edit`,
            publicUrl: `/projects`,
          }))
        : [];

    const posts: SearchResultItem[] =
      postsRes.status === 'fulfilled' && postsRes.value.data
        ? postsRes.value.data.map((po) => ({
            id: po.id,
            title: po.title,
            subtitle: `Status: ${po.status}`,
            category: po.category,
            type: 'post',
            adminUrl: `/admin/posts/${po.id}/edit`,
            publicUrl: `/posts`,
          }))
        : [];

    const careers: SearchResultItem[] =
      careersRes.status === 'fulfilled' && careersRes.value.data
        ? careersRes.value.data.map((c) => ({
            id: c.id,
            title: c.title,
            subtitle: `Status: ${c.status}`,
            category: c.category,
            type: 'career',
            adminUrl: `/admin/careers/${c.id}/edit`,
            publicUrl: `/careers`,
          }))
        : [];

    const team: SearchResultItem[] =
      teamRes.status === 'fulfilled' && teamRes.value.data
        ? teamRes.value.data.map((t) => ({
            id: t.id,
            title: t.name,
            subtitle: t.designation,
            type: 'team',
            adminUrl: `/admin/team/${t.id}/edit`,
          }))
        : [];

    const gallery: SearchResultItem[] =
      galleryRes.status === 'fulfilled' && galleryRes.value.data
        ? galleryRes.value.data.map((g) => ({
            id: g.id,
            title: g.name,
            subtitle: g.description || undefined,
            type: 'gallery',
            adminUrl: `/admin/gallery`,
            publicUrl: `/gallery`,
          }))
        : [];

    const totalResults =
      events.length +
      projects.length +
      posts.length +
      careers.length +
      team.length +
      gallery.length;

    return {
      events,
      projects,
      posts,
      careers,
      team,
      gallery,
      totalResults,
    };
  } catch (err) {
    console.error('adminGlobalSearch error:', err);
    return emptyResult;
  }
}
