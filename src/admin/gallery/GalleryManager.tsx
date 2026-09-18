import React, { useState, useEffect, useCallback } from 'react';
import { 
  Image as ImageIcon, FolderPlus, Edit2, Trash2, Star 
} from 'lucide-react';
import { 
  adminGetAlbums, 
  adminCreateAlbum, 
  adminUpdateAlbum, 
  adminDeleteAlbum,
  adminGetAlbumImages,
  adminGetAllGalleryImages,
  adminAddGalleryImage,
  adminUpdateGalleryImage,
  adminDeleteGalleryImage 
} from '../../services/gallery';
import { adminGetEvents } from '../../services/events';
import { deleteImage } from '../../services/storage';
import type { GalleryAlbum, GalleryImage, Event } from '../../types/supabase';
import { ImageUploader } from './ImageUploader';
import { Modal } from '../shared/Modal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { showToast } from '../shared/Toast';

export const GalleryManager: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null); // null means 'all'
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);

  // Album modal states
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [albumFormData, setAlbumFormData] = useState({
    name: '',
    description: '',
    event_id: '',
    published: true,
  });
  const [savingAlbum, setSavingAlbum] = useState(false);

  // Delete dialogs
  const [deleteAlbumId, setDeleteAlbumId] = useState<string | null>(null);
  const [deletingAlbum, setDeletingAlbum] = useState(false);

  const [deleteImageTarget, setDeleteImageTarget] = useState<GalleryImage | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);

  // Load albums & events
  const loadAlbumsAndEvents = useCallback(async () => {
    setLoadingAlbums(true);
    try {
      const [albumsRes, eventsRes] = await Promise.all([
        adminGetAlbums({ page: 1, pageSize: 100 }),
        adminGetEvents({ page: 1, pageSize: 100 }),
      ]);
      setAlbums(albumsRes.data);
      setEventsList(eventsRes.data);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load albums');
    } finally {
      setLoadingAlbums(false);
    }
  }, []);

  // Load images for current selection
  const loadImages = useCallback(async () => {
    setLoadingImages(true);
    try {
      if (selectedAlbumId === null) {
        const res = await adminGetAllGalleryImages({ page: 1, pageSize: 100 });
        setImages(res.data);
      } else {
        const data = await adminGetAlbumImages(selectedAlbumId);
        setImages(data);
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load gallery images');
    } finally {
      setLoadingImages(false);
    }
  }, [selectedAlbumId]);

  useEffect(() => {
    loadAlbumsAndEvents();
  }, [loadAlbumsAndEvents]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Handle Album Create / Edit
  const openCreateAlbum = () => {
    setEditingAlbum(null);
    setAlbumFormData({
      name: '',
      description: '',
      event_id: '',
      published: true,
    });
    setIsAlbumModalOpen(true);
  };

  const openEditAlbum = (album: GalleryAlbum) => {
    setEditingAlbum(album);
    setAlbumFormData({
      name: album.name,
      description: album.description || '',
      event_id: album.event_id || '',
      published: album.published,
    });
    setIsAlbumModalOpen(true);
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumFormData.name.trim()) {
      showToast.error('Please enter an album name');
      return;
    }

    setSavingAlbum(true);
    try {
      const payload = {
        name: albumFormData.name.trim(),
        description: albumFormData.description.trim() || null,
        event_id: albumFormData.event_id || null,
        published: albumFormData.published,
        sort_order: editingAlbum ? editingAlbum.sort_order : albums.length,
        cover_image_url: editingAlbum ? editingAlbum.cover_image_url : null,
      };

      if (editingAlbum) {
        await adminUpdateAlbum(editingAlbum.id, payload);
        showToast.success('Album updated successfully');
      } else {
        const created = await adminCreateAlbum(payload);
        showToast.success('Album created successfully');
        setSelectedAlbumId(created.id);
      }

      setIsAlbumModalOpen(false);
      loadAlbumsAndEvents();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to save album');
    } finally {
      setSavingAlbum(false);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!deleteAlbumId) return;
    setDeletingAlbum(true);
    try {
      await adminDeleteAlbum(deleteAlbumId);
      showToast.success('Album deleted successfully');
      if (selectedAlbumId === deleteAlbumId) {
        setSelectedAlbumId(null);
      }
      setDeleteAlbumId(null);
      loadAlbumsAndEvents();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to delete album');
    } finally {
      setDeletingAlbum(false);
    }
  };

  // Handle Image Uploads from ImageUploader
  const handleUploadSuccess = async (
    uploadedResults: Array<{ image_url: string; storage_path: string; caption: string }>
  ) => {
    try {
      for (let i = 0; i < uploadedResults.length; i++) {
        const item = uploadedResults[i];
        await adminAddGalleryImage({
          album_id: selectedAlbumId,
          image_url: item.image_url,
          storage_path: item.storage_path,
          title: item.caption || null,
          caption: item.caption || null,
          category: 'General',
          date: new Date().toISOString().split('T')[0],
          featured: false,
          sort_order: images.length + i,
        });
      }
      loadImages();
    } catch (err: any) {
      showToast.error('Failed to register uploaded images in database');
    }
  };

  // Delete Image
  const handleDeleteImage = async () => {
    if (!deleteImageTarget) return;
    setDeletingImage(true);
    try {
      if (deleteImageTarget.storage_path) {
        try {
          await deleteImage('gallery-images', deleteImageTarget.storage_path);
        } catch (storageErr) {
          console.warn('Storage image cleanup error:', storageErr);
        }
      }
      await adminDeleteGalleryImage(deleteImageTarget.id);
      showToast.success('Photo deleted');
      setDeleteImageTarget(null);
      loadImages();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to delete photo');
    } finally {
      setDeletingImage(false);
    }
  };

  // Toggle Image Featured
  const handleToggleImageFeatured = async (image: GalleryImage) => {
    try {
      await adminUpdateGalleryImage(image.id, { featured: !image.featured });
      showToast.success(image.featured ? 'Removed from featured' : 'Marked as featured');
      loadImages();
    } catch (err: any) {
      showToast.error('Failed to update featured status');
    }
  };

  // Set Album Cover
  const handleSetAlbumCover = async (imageUrl: string) => {
    if (!selectedAlbum) return;
    try {
      await adminUpdateAlbum(selectedAlbum.id, { cover_image_url: imageUrl });
      showToast.success('Album cover updated');
      loadAlbumsAndEvents();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update album cover');
    }
  };

  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-[#D7B65A]" />
            Photo Gallery CMS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize albums, event captures, and standalone high-resolution photos
          </p>
        </div>

        <button
          onClick={openCreateAlbum}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer w-full sm:w-auto"
        >
          <FolderPlus className="w-4 h-4" />
          Create New Album
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Album Sidebar (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Albums ({albums.length})
            </span>
          </div>

          <div className="glass-panel p-2 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-1">
            {/* All Photos button */}
            <button
              onClick={() => setSelectedAlbumId(null)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedAlbumId === null
                  ? 'bg-[#D7B65A] text-[#07111F] shadow-sm'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4" />
                <span>All Photographs</span>
              </div>
            </button>

            {/* Album list */}
            {loadingAlbums ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              albums.map((album) => (
                <div
                  key={album.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                    selectedAlbumId === album.id
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <button
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="flex-1 text-left truncate mr-2 cursor-pointer"
                  >
                    <div className="truncate">{album.name}</div>
                    {album.event_id && (
                      <div className="text-[10px] text-[#D7B65A] font-normal truncate">
                        Linked to event
                      </div>
                    )}
                  </button>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditAlbum(album);
                      }}
                      className="p-1 text-slate-400 hover:text-[#D7B65A] rounded hover:bg-white/10 cursor-pointer"
                      title="Edit Album"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteAlbumId(album.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/10 cursor-pointer"
                      title="Delete Album"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gallery Content (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Album Banner */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0c192e]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {selectedAlbum ? selectedAlbum.name : 'All Photographs'}
                </h2>
                {selectedAlbum && (
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      selectedAlbum.published
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {selectedAlbum.published ? 'Published' : 'Draft'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedAlbum?.description || 'Showing photos from all albums and uploads'}
              </p>
            </div>

            {selectedAlbum && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditAlbum(selectedAlbum)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Edit Album Details
                </button>
              </div>
            )}
          </div>

          {/* Image Uploader */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0c192e]/60">
            <h3 className="text-sm font-semibold text-white mb-3">
              Upload Photos {selectedAlbum ? `to "${selectedAlbum.name}"` : 'to Gallery'}
            </h3>
            <ImageUploader
              entityId={selectedAlbumId || 'gallery-general'}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>

          {/* Photo Grid */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0c192e]/40">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Photos ({images.length})
              </span>
            </div>

            {loadingImages ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : images.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="No photos in this album"
                description="Use the uploader above to add high-resolution photos."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#07111F]/80 aspect-square"
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || 'Gallery photo'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                      {/* Top Action: Featured star & Cover Photo */}
                      <div className="flex justify-end items-center gap-1.5">
                        {selectedAlbum && (
                          <button
                            onClick={() => handleSetAlbumCover(image.image_url)}
                            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
                              selectedAlbum.cover_image_url === image.image_url
                                ? 'bg-[#D7B65A] text-[#07111F]'
                                : 'bg-black/50 text-white hover:bg-black/80'
                            }`}
                            title={
                              selectedAlbum.cover_image_url === image.image_url
                                ? 'Current album cover'
                                : 'Set as album cover'
                            }
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleImageFeatured(image)}
                          className={`p-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
                            image.featured
                              ? 'bg-[#D7B65A] text-[#07111F]'
                              : 'bg-black/50 text-white hover:bg-black/80'
                          }`}
                          title={image.featured ? 'Featured' : 'Mark as featured'}
                        >
                          <Star className={`w-3.5 h-3.5 ${image.featured ? 'fill-[#07111F]' : ''}`} />
                        </button>
                      </div>

                      {/* Bottom Details & Delete */}
                      <div className="flex items-end justify-between gap-2">
                        <p className="text-xs text-white line-clamp-2 drop-shadow">
                          {image.caption || image.title || 'Untitled'}
                        </p>
                        <button
                          onClick={() => setDeleteImageTarget(image)}
                          className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer flex-shrink-0"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Album Create/Edit Modal */}
      <Modal
        isOpen={isAlbumModalOpen}
        title={editingAlbum ? 'Edit Album' : 'Create New Album'}
        onClose={() => setIsAlbumModalOpen(false)}
      >
        <form onSubmit={handleSaveAlbum} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Album Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={albumFormData.name}
              onChange={(e) => setAlbumFormData({ ...albumFormData, name: e.target.value })}
              placeholder="e.g. 15th Installation Ceremony 2024-25"
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={albumFormData.description}
              onChange={(e) => setAlbumFormData({ ...albumFormData, description: e.target.value })}
              placeholder="Brief description of the event or photo series..."
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Link to Event (Optional)
            </label>
            <select
              value={albumFormData.event_id}
              onChange={(e) => setAlbumFormData({ ...albumFormData, event_id: e.target.value })}
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60"
            >
              <option value="">-- No linked event (Standalone Album) --</option>
              {eventsList.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({event.event_date || 'No date'})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={albumFormData.published}
                onChange={(e) => setAlbumFormData({ ...albumFormData, published: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 text-[#D7B65A] focus:ring-0 bg-[#07111F]"
              />
              <span className="text-sm text-white font-medium">Publish album to public gallery</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAlbumModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingAlbum}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {savingAlbum ? 'Saving...' : editingAlbum ? 'Update Album' : 'Create Album'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Album Dialog */}
      <ConfirmDialog
        isOpen={!!deleteAlbumId}
        title="Delete Album"
        message="Are you sure you want to delete this album? Photos in this album will become uncategorized but won't be deleted."
        confirmLabel="Delete Album"
        confirmVariant="danger"
        isLoading={deletingAlbum}
        onConfirm={handleDeleteAlbum}
        onCancel={() => setDeleteAlbumId(null)}
      />

      {/* Delete Photo Dialog */}
      <ConfirmDialog
        isOpen={!!deleteImageTarget}
        title="Delete Photograph"
        message="Are you sure you want to delete this photo from the gallery? This action cannot be undone."
        confirmLabel="Delete Photo"
        confirmVariant="danger"
        isLoading={deletingImage}
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteImageTarget(null)}
      />
    </div>
  );
};
