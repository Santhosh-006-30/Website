import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Layers,
  Maximize2,
  Calendar,
  Grid3X3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "./SEO";
import {
  getPublishedAlbumsWithImages,
  type AlbumWithImages,
} from "../services/gallery";
import { getPublishedGalleryImages } from "../services/gallery";
import type { GalleryImage } from "../types/supabase";
import { GALLERY_ITEMS } from "../data/gallery";
import type { GalleryItem } from "../types";

function staticToGalleryImage(s: GalleryItem): GalleryImage {
  return {
    id: s.id,
    album_id: null,
    image_url: s.image,
    storage_path: null,
    title: s.title,
    caption: s.caption ?? null,
    category: s.category,
    date: s.date,
    featured: false,
    sort_order: 0,
    created_at: "",
  };
}

interface LightboxProps {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, prev, next]);

  const photo = images[currentIndex];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/92 backdrop-blur-xl"
      />
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B65A]"
        aria-label="Close lightbox"
      >
        <X className="w-5 h-5" />
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 sm:left-5 z-20 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B65A]"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 sm:right-5 z-20 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B65A]"
            aria-label="Next photograph"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-4xl w-full z-10 flex flex-col items-center"
      >
        <div className="relative rounded-2xl overflow-hidden w-full max-h-[72vh] border border-white/20 shadow-2xl bg-black">
          <img
            src={photo.image_url}
            alt={photo.title ?? "Gallery photo"}
            className="max-h-[72vh] w-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="mt-4 text-center max-w-2xl w-full text-white space-y-1 px-4">
          <div className="text-xs uppercase font-bold tracking-wider text-[#D7B65A]">
            {photo.category}{photo.date ? ` • ${photo.date}` : ""}
          </div>
          {photo.title && (
            <h3 className="font-heading font-bold text-lg sm:text-xl">{photo.title}</h3>
          )}
          {photo.caption && (
            <p className="text-xs sm:text-sm text-slate-300">{photo.caption}</p>
          )}
          {images.length > 1 && (
            <p className="text-xs text-slate-500 mt-1">{currentIndex + 1} / {images.length}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface PhotoGridProps {
  photos: GalleryImage[];
  onOpen: (index: number) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onOpen }) => {
  if (photos.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No photos in this album yet.</p>
      </div>
    );
  }
  return (
    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {photos.map((photo, idx) => {
        const isLarge = idx === 0 || idx === 5 || idx === 10;
        return (
          <motion.div
            layout
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
            onClick={() => onOpen(idx)}
            className={`group relative rounded-2xl overflow-hidden glass-card border border-white/10 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 ${isLarge ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}
          >
            <img
              src={photo.image_url}
              alt={photo.title ?? "Gallery photo"}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#07111F]/80 text-[#D7B65A] border border-[#D7B65A]/30 backdrop-blur-md">
                {photo.category}
              </span>
            </div>
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              {photo.date && (
                <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-0.5">
                  <Calendar className="w-3 h-3 text-[#D7B65A]" />
                  <span>{photo.date}</span>
                </div>
              )}
              {photo.title && (
                <h4 className="font-heading font-bold text-white text-sm sm:text-base leading-snug group-hover:text-[#E8D89A] transition-colors line-clamp-2">
                  {photo.title}
                </h4>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

type ViewMode = "albums" | "all";

export const GalleryPage = () => {
  const [albums, setAlbums] = useState<AlbumWithImages[]>([]);
  const [allPhotos, setAllPhotos] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("albums");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<GalleryImage[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const albumData = await getPublishedAlbumsWithImages();
        const flatImages = await getPublishedGalleryImages();
        if (!mounted) return;
        const hasDatabaseContent = albumData.length > 0 || flatImages.length > 0;
        if (hasDatabaseContent) {
          setAlbums(albumData);
          setAllPhotos(flatImages.length > 0 ? flatImages : GALLERY_ITEMS.map(staticToGalleryImage));
        } else {
          setAllPhotos(GALLERY_ITEMS.map(staticToGalleryImage));
        }
      } catch (err) {
        if (!mounted) return;
        console.error("[GalleryPage] fetch error:", err);
        setError("Could not load gallery. Using local archive.");
        setAllPhotos(GALLERY_ITEMS.map(staticToGalleryImage));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const allCategories = ["ALL", ...Array.from(new Set(allPhotos.map((p) => p.category).filter(Boolean)))];
  const filteredAllPhotos = activeCategory === "ALL" ? allPhotos : allPhotos.filter((p) => p.category === activeCategory);

  const openLightboxForAlbum = (album: AlbumWithImages, imgIdx: number) => {
    setLightboxPhotos(album.images);
    setLightboxIndex(imgIdx);
  };
  const openLightboxForAll = (idx: number) => {
    setLightboxPhotos(filteredAllPhotos);
    setLightboxIndex(idx);
  };
  const closeLightbox = () => {
    setLightboxIndex(null);
    setLightboxPhotos([]);
  };

  const totalImages = albums.reduce((acc, a) => acc + a.images.length, 0) || allPhotos.length;

  return (
    <>
      <SEO
        title="Community Gallery"
        description="Browse the visual archive of the Rotaract Club of Lead India Ahead — events, projects, community service, and leadership moments captured across MAAYON 2026-27."
        canonicalPath="/gallery"
        ogType="website"
      />
      <div className="min-h-screen bg-[#07111F] text-white">
        <section className="relative pt-28 pb-10 sm:pt-36 sm:pb-14 overflow-hidden border-b border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[#D7B65A]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
              <Link to="/" className="hover:text-[#D7B65A] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-300">Gallery</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-4">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Visual Archive</span>
                </div>
                <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none">
                  COMMUNITY <span className="gold-gradient-text">GALLERY</span>
                </h1>
                <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl">
                  A curated visual chronicle of moments that define our journey — events, projects, leadership and service.
                </p>
              </div>
              {!loading && (
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  {albums.length > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-[#D7B65A]">{albums.length}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Albums</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white">{totalImages}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Photos</div>
                  </div>
                </div>
              )}
            </div>
            {albums.length > 0 && (
              <div className="mt-8 flex items-center gap-2">
                <button
                  onClick={() => { setViewMode("albums"); setSelectedAlbumId(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${viewMode === "albums" ? "bg-[#D7B65A] text-[#07111F]" : "bg-white/5 text-slate-300 hover:text-white border border-white/10"}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  By Album
                </button>
                <button
                  onClick={() => { setViewMode("all"); setSelectedAlbumId(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${viewMode === "all" ? "bg-[#D7B65A] text-[#07111F]" : "bg-white/5 text-slate-300 hover:text-white border border-white/10"}`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  All Photos
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <span>Warning:</span>
                <span>{error}</span>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-[#D7B65A]/20 border-t-[#D7B65A] animate-spin" />
                <p className="text-slate-400 text-sm">Loading gallery...</p>
              </div>
            )}

            {!loading && viewMode === "albums" && !selectedAlbumId && (
              <>
                {albums.length === 0 ? (
                  <div>
                    <p className="text-slate-400 text-sm mb-8">Albums coming soon. Browse all photos below.</p>
                    <PhotoGrid photos={allPhotos} onOpen={openLightboxForAll} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => {
                      const cover = album.cover_image_url ?? album.images[0]?.image_url ?? null;
                      return (
                        <motion.div
                          key={album.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          onClick={() => setSelectedAlbumId(album.id)}
                          className="group relative rounded-2xl overflow-hidden glass-card border border-white/10 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 aspect-[4/3]"
                        >
                          {cover ? (
                            <img src={cover} alt={album.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#10233D] to-[#07111F] flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-white/10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#07111F]/80 text-[#D7B65A] border border-[#D7B65A]/30 backdrop-blur-md">
                              {album.images.length} photo{album.images.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h2 className="font-heading font-bold text-white text-base sm:text-lg leading-snug group-hover:text-[#E8D89A] transition-colors">
                              {album.name}
                            </h2>
                            {album.description && (
                              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{album.description}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {!loading && viewMode === "albums" && selectedAlbumId && (() => {
              const album = albums.find((a) => a.id === selectedAlbumId);
              if (!album) return null;
              return (
                <div>
                  <button
                    onClick={() => setSelectedAlbumId(null)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#D7B65A] transition-colors mb-8 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    All Albums
                  </button>
                  <div className="mb-8">
                    <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">{album.name}</h2>
                    {album.description && (
                      <p className="text-slate-400 text-sm mt-1 max-w-2xl">{album.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {album.images.length} photograph{album.images.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <PhotoGrid photos={album.images} onOpen={(idx) => openLightboxForAlbum(album, idx)} />
                </div>
              );
            })()}

            {!loading && viewMode === "all" && (
              <div>
                {allCategories.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory === cat ? "bg-[#D7B65A] text-[#07111F] shadow-lg shadow-[#D7B65A]/20" : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PhotoGrid photos={filteredAllPhotos} onOpen={openLightboxForAll} />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {!loading && albums.length === 0 && viewMode === "albums" && allPhotos.length === 0 && (
              <div className="text-center py-24 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300">Gallery Coming Soon</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  We are curating our visual archive. Check back soon for photos from our events and projects.
                </p>
                <Link to="/" className="inline-flex items-center gap-2 mt-4 text-sm text-[#D7B65A] hover:underline">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            )}
          </div>
        </section>

        <div className="border-t border-white/5 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#D7B65A] transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Home
            </Link>
            <p className="text-xs text-slate-600 text-center">Rotaract Club of Lead India Ahead - MAAYON 2026-27</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && lightboxPhotos.length > 0 && (
          <Lightbox images={lightboxPhotos} initialIndex={lightboxIndex} onClose={closeLightbox} />
        )}
      </AnimatePresence>
    </>
  );
};
