import { supabase } from '../lib/supabase';

// Allowed MIME types for image uploads
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export type StorageBucket = 'event-images' | 'project-images' | 'gallery-images' | 'team-images';

export interface UploadResult {
  url: string;
  storagePath: string;
}

/**
 * Generate a safe, unique storage path that prevents path traversal and collisions.
 */
function generateSafeStoragePath(
  _bucket: StorageBucket,
  prefix: string,
  file: File
): string {
  const uuid = crypto.randomUUID();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeName = `${uuid}.${ext}`;
  // prefix is typically an entity id (event id, etc.)
  const safePrefix = prefix.replace(/[^a-zA-Z0-9-_]/g, '');
  return `${safePrefix}/${safeName}`;
}

/**
 * Validate a file before upload. Returns error string or null.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File type not allowed: ${file.type}. Please use JPG, PNG, or WEBP.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

/**
 * Upload an image file to Supabase Storage.
 * Returns the public URL and storage path.
 */
export async function uploadImage(
  bucket: StorageBucket,
  entityId: string,
  file: File
): Promise<UploadResult> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const storagePath = generateSafeStoragePath(bucket, entityId, file);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL after upload.');
  }

  return {
    url: urlData.publicUrl,
    storagePath,
  };
}

/**
 * Delete an image from Supabase Storage by its storage path.
 */
export async function deleteImage(bucket: StorageBucket, storagePath: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * Get public URL for a storage path (without re-uploading).
 */
export function getPublicUrl(bucket: StorageBucket, storagePath: string): string | null {
  if (!supabase) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data?.publicUrl ?? null;
}

/**
 * Upload multiple images and return results (with per-file error handling).
 */
export async function uploadMultipleImages(
  bucket: StorageBucket,
  entityId: string,
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<Array<UploadResult & { file: File; error?: string }>> {
  const results: Array<UploadResult & { file: File; error?: string }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const result = await uploadImage(bucket, entityId, file);
      results.push({ ...result, file });
    } catch (err) {
      results.push({
        url: '',
        storagePath: '',
        file,
        error: err instanceof Error ? err.message : 'Upload failed',
      });
    }
    onProgress?.(i + 1, files.length);
  }

  return results;
}
