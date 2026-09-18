import { supabase } from '../lib/supabase';
import type { GalleryAlbum, GalleryImage, PaginatedResult, PaginationOptions } from '../types/supabase';
import { logAuditEvent } from './audit';

export async function getPublishedGalleryImages(): Promise<GalleryImage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*, gallery_albums!left(published)')
    .or('album_id.is.null,gallery_albums.published.eq.true')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[gallery] getPublishedGalleryImages error:', error.message);
    return [];
  }
  return (data ?? []).map((row: any) => {
    const { gallery_albums: _ga, ...img } = row;
    return img as GalleryImage;
  });
}

export interface AlbumWithImages extends GalleryAlbum {
  images: GalleryImage[];
}

export async function getPublishedAlbumsWithImages(): Promise<AlbumWithImages[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*, gallery_images(id, image_url, title, caption, category, date, featured, sort_order, created_at, album_id, storage_path)')
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[gallery] getPublishedAlbumsWithImages error:', error.message);
    return [];
  }
  return (data ?? []).map((album: any) => ({
    ...album,
    images: (album.gallery_images ?? []).sort((a: GalleryImage, b: GalleryImage) => a.sort_order - b.sort_order),
  }));
}

export async function getPublishedAlbums(): Promise<GalleryAlbum[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function adminGetAlbums(
  options: PaginationOptions
): Promise<PaginatedResult<GalleryAlbum>> {
  if (!supabase) throw new Error('Supabase not configured');
  const { page, pageSize } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('gallery_albums')
    .select('*', { count: 'exact' })
    .order('sort_order', { ascending: true })
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

export async function adminGetAlbum(id: string): Promise<GalleryAlbum | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminCreateAlbum(
  albumData: Omit<GalleryAlbum, 'id' | 'created_at' | 'updated_at'>
): Promise<GalleryAlbum> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('gallery_albums')
    .insert([albumData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'CREATE',
    entityType: 'gallery_album',
    entityId: data.id,
    entityName: data.name,
  });
  return data;
}

export async function adminUpdateAlbum(
  id: string,
  updates: Partial<Omit<GalleryAlbum, 'id' | 'created_at'>>
): Promise<GalleryAlbum> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('gallery_albums')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'UPDATE',
    entityType: 'gallery_album',
    entityId: data.id,
    entityName: data.name,
    metadata: { fields: Object.keys(updates) },
  });
  return data;
}

export async function adminDeleteAlbum(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('gallery_albums').delete().eq('id', id);
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'DELETE',
    entityType: 'gallery_album',
    entityId: id,
  });
}

export async function adminGetAlbumImages(albumId: string): Promise<GalleryImage[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('album_id', albumId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminGetAllGalleryImages(
  options: PaginationOptions
): Promise<PaginatedResult<GalleryImage>> {
  if (!supabase) throw new Error('Supabase not configured');
  const { page, pageSize } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('gallery_images')
    .select('*', { count: 'exact' })
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

export async function adminAddGalleryImage(
  imageData: Omit<GalleryImage, 'id' | 'created_at'>
): Promise<GalleryImage> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('gallery_images')
    .insert([imageData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'UPLOAD',
    entityType: 'gallery_image',
    entityId: data.id,
    entityName: data.title ?? undefined,
    metadata: { album_id: data.album_id, image_url: data.image_url },
  });
  return data;
}

export async function adminUpdateGalleryImage(
  id: string,
  updates: Partial<Omit<GalleryImage, 'id' | 'created_at'>>
): Promise<GalleryImage> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('gallery_images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'UPDATE',
    entityType: 'gallery_image',
    entityId: data.id,
    entityName: data.title ?? undefined,
  });
  return data;
}

export async function adminDeleteGalleryImage(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);
  if (error) throw new Error(error.message);
  void logAuditEvent({
    action: 'DELETE_IMAGE',
    entityType: 'gallery_image',
    metadata: { image_id: id },
  });
}

export async function adminGetGalleryStats(): Promise<{ total: number; albums: number }> {
  if (!supabase) return { total: 0, albums: 0 };
  const [imagesResult, albumsResult] = await Promise.all([
    supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
    supabase.from('gallery_albums').select('id', { count: 'exact', head: true }),
  ]);
  return {
    total: imagesResult.count ?? 0,
    albums: albumsResult.count ?? 0,
  };
}
