import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Calendar, Maximize2 } from "lucide-react";
import { GALLERY_ITEMS } from "../data/gallery";

export const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const categories = ["ALL", "EVENTS", "PROJECTS", "COMMUNITY", "LEADERSHIP"];

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeCategory === "ALL") return true;
    return item.category === activeCategory;
  });

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === "Escape") {
        setSelectedPhotoIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev === 0 ? filteredItems.length - 1 : prev - 1) : null
        );
      } else if (e.key === "ArrowRight") {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev === filteredItems.length - 1 ? 0 : prev + 1) : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, filteredItems.length]);

  return (
    <section id="gallery" className="py-24 bg-[#0B1728] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-3">
              <ImageIcon className="w-3.5 h-3.5 text-[#D7B65A]" />
              <span>Visual Chronicle</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              COMMUNITY <span className="gold-gradient-text">GALLERY</span>
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 md:mt-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-[#D7B65A] text-[#07111F] shadow-lg shadow-[#D7B65A]/20"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial Masonry Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredItems.map((item, idx) => {
              // Create editorial asymmetric rhythm: 1st and 5th items span slightly different
              const isLarge = idx === 0 || idx === 5;

              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`group relative rounded-2xl overflow-hidden glass-card border border-white/10 cursor-pointer shadow-lg hover:shadow-2xl transition-all ${
                    isLarge ? "sm:col-span-2 lg:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Category Badge */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <span className="px-2 sm:px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#07111F]/80 text-[#D7B65A] border border-[#D7B65A]/30 backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Expand Icon */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>

                  {/* Bottom Text */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                    <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-slate-400 mb-1">
                      <Calendar className="w-3 h-3 text-[#D7B65A]" />
                      <span>{item.date}</span>
                    </div>
                    <h4 className="font-heading font-bold text-white text-sm sm:text-base lg:text-lg leading-snug group-hover:text-[#E8D89A] transition-colors">
                      {item.title}
                    </h4>
                    {item.caption && (
                      <p className="text-[11px] sm:text-xs text-slate-300 font-normal line-clamp-1 mt-0.5">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && filteredItems[selectedPhotoIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhotoIndex(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-lg"
            />

            {/* Controls */}
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close fullscreen view"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={() =>
                setSelectedPhotoIndex((prev) =>
                  prev !== null ? (prev === 0 ? filteredItems.length - 1 : prev - 1) : null
                )
              }
              className="absolute left-2 sm:left-6 z-20 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
              aria-label="Previous photograph"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={() =>
                setSelectedPhotoIndex((prev) =>
                  prev !== null ? (prev === filteredItems.length - 1 ? 0 : prev + 1) : null
                )
              }
              className="absolute right-2 sm:right-6 z-20 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
              aria-label="Next photograph"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Content Modal */}
            <motion.div
              key={selectedPhotoIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl w-full z-10 flex flex-col items-center"
            >
              <div className="relative rounded-2xl overflow-hidden max-h-[75vh] w-auto border border-white/20 shadow-2xl bg-black">
                <img
                  src={filteredItems[selectedPhotoIndex].image}
                  alt={filteredItems[selectedPhotoIndex].title}
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>

              <div className="mt-4 text-center max-w-xl text-white space-y-1">
                <div className="text-xs uppercase font-bold tracking-wider text-[#D7B65A]">
                  {filteredItems[selectedPhotoIndex].category} • {filteredItems[selectedPhotoIndex].date}
                </div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl">
                  {filteredItems[selectedPhotoIndex].title}
                </h3>
                {filteredItems[selectedPhotoIndex].caption && (
                  <p className="text-xs sm:text-sm text-slate-300 font-normal">
                    {filteredItems[selectedPhotoIndex].caption}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
