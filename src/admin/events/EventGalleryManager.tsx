import { useCallback, useEffect, useState } from 'react';
import {
  GripVertical, Star, Trash2, ChevronUp, ChevronDown, Pencil, X, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminGetEventImages, adminAddEventImage, adminDeleteEventImage,
  adminSetCoverImage, adminReorderEventImages, adminUpdateEventImage,
} from '../../services/events';
import { deleteImage } from '../../services/storage';
import { EventImageUploader } from './EventImageUploader';
import type { EventImage } from '../../types/supabase';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';

interface EventGalleryManagerProps {
  eventId: string;
}

export function EventGalleryManager({ eventId }: EventGalleryManagerProps) {
  const [images, setImages] = useState<EventImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<EventImage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');

  const loadImages = useCallback(async () => {
    try {
      const data = await adminGetEventImages(eventId);
      setImages(data);
    } catch (err) {
      toast.error('Failed to load gallery images.');
      console.error('[EventGalleryManager] loadImages error:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { void loadImages(); }, [loadImages]);

  const handleUploaded = async (url: string, storagePath: string) => {
    try {
      const newImage = await adminAddEventImage({
        event_id: eventId,
        image_url: url,
        storage_path: storagePath,
        caption: null,
        sort_order: images.length,
        is_cover: images.length === 0, // First image becomes cover
      });
      setImages((prev) => [...prev, newImage]);
      toast.success('Image uploaded successfully.');
    } catch {
      toast.error('Failed to save image record.');
    }
  };

  const handleSetCover = async (image: EventImage) => {
    try {
      await adminSetCoverImage(eventId, image.id);
      setImages((prev) => prev.map((img) => ({ ...img, is_cover: img.id === image.id })));
      toast.success('Cover image updated.');
    } catch {
      toast.error('Failed to set cover image.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.storage_path) {
        await deleteImage('event-images', deleteTarget.storage_path);
      }
      await adminDeleteEventImage(deleteTarget.id);
      setImages((prev) => prev.filter((img) => img.id !== deleteTarget.id));
      toast.success('Image deleted.');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete image.');
    } finally {
      setDeleting(false);
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    const reordered = newImages.map((img, i) => ({ ...img, sort_order: i }));
    setImages(reordered);
    try {
      await adminReorderEventImages(
        reordered.map((img) => ({ id: img.id, sort_order: img.sort_order }))
      );
    } catch {
      toast.error('Failed to save order.');
    }
  };

  const saveCaption = async (id: string) => {
    try {
      await adminUpdateEventImage(id, { caption: captionDraft || null });
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, caption: captionDraft || null } : img))
      );
      toast.success('Caption saved.');
    } catch {
      toast.error('Failed to save caption.');
    } finally {
      setEditingCaption(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">Event Gallery</h3>
        <p className="text-sm text-slate-500">
          Upload photographs from this event. The cover image will be displayed on event cards.
        </p>
      </div>

      {/* Uploader */}
      <EventImageUploader
        bucket="event-images"
        entityId={eventId}
        onUploaded={handleUploaded}
      />

      {/* Gallery Grid */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-3">
          Uploaded Images ({images.length})
        </h4>

        {loading ? (
          <LoadingSpinner label="Loading gallery…" />
        ) : images.length === 0 ? (
          <EmptyState title="No images yet" description="Upload photographs above to populate the event gallery." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="flex gap-3 p-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: image.is_cover
                    ? '1px solid rgba(215,182,90,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  <img
                    src={image.image_url}
                    alt={image.caption ?? 'Event photo'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info & Actions */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    {image.is_cover && (
                      <span className="text-xs font-medium text-[#D7B65A] flex items-center gap-1">
                        <Star className="w-3 h-3" /> Cover
                      </span>
                    )}
                    <span className="text-xs text-slate-600 ml-auto">#{index + 1}</span>
                  </div>

                  {/* Caption */}
                  {editingCaption === image.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        value={captionDraft}
                        onChange={(e) => setCaptionDraft(e.target.value)}
                        placeholder="Add a caption…"
                        className="flex-1 text-xs bg-white/8 border border-white/15 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void saveCaption(image.id);
                          if (e.key === 'Escape') setEditingCaption(null);
                        }}
                      />
                      <button onClick={() => void saveCaption(image.id)} className="text-emerald-400 hover:text-emerald-300">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingCaption(null)} className="text-slate-500 hover:text-slate-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingCaption(image.id); setCaptionDraft(image.caption ?? ''); }}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors text-left mb-2 truncate block w-full"
                    >
                      {image.caption ? (
                        <><Pencil className="w-3 h-3 inline mr-1" />{image.caption}</>
                      ) : (
                        <><Pencil className="w-3 h-3 inline mr-1" />Add caption…</>
                      )}
                    </button>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {!image.is_cover && (
                      <button
                        onClick={() => void handleSetCover(image)}
                        className="p-1 text-slate-500 hover:text-[#D7B65A] transition-colors"
                        title="Set as cover"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(image)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors ml-auto"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Image"
        message="This will permanently delete the image from storage. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
