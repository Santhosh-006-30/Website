import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, ShieldCheck, Users, Tag, ExternalLink } from "lucide-react";
import type { Event } from "../types";

interface EventModalProps {
  event: Event | null;
  onClose: () => void;
}

export const EventModal = ({ event, onClose }: EventModalProps) => {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!event) return null;

  const roleBadges: Record<string, { label: string; color: string }> = {
    ORGANIZER: { label: "LIA Organized", color: "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40" },
    CO_ORGANIZER: { label: "Joint Collaboration", color: "bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/40" },
    PARTICIPANT: { label: "LIA Participation", color: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40" },
    REPRESENTATIVE: { label: "District Representation", color: "bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/40" },
  };

  const badge = roleBadges[event.liaRole] || { label: event.liaRole, color: "bg-white/10 text-white border-white/20" };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-3xl glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl z-10 max-h-[92vh] flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/20 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Image */}
          <div className="relative h-44 sm:h-60 md:h-72 w-full shrink-0">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-[#10233D] flex items-center justify-center text-slate-500 text-xs sm:text-sm">
                LIA Official Event Record
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-[#0B1728]/40 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <span className={`px-2 py-0.5 sm:px-2.5 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="px-2 py-0.5 sm:px-2.5 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#07111F]/80 text-[#D7B65A] border border-[#D7B65A]/40 backdrop-blur-md">
                  {event.category}
                </span>
              </div>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl text-white leading-tight">
                {event.title}
              </h3>
              {event.subtitle && (
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 truncate">
                  {event.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-5 sm:space-y-6">
            {/* Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#D7B65A]" />
                <span><strong>Date:</strong> {event.displayDate || event.date}</span>
              </div>
              {event.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#06B6D4]" />
                  <span><strong>Venue:</strong> {event.location}</span>
                </div>
              )}
              {event.organizer && (
                <div className="flex items-center space-x-2 sm:col-span-2">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span><strong>Organizer:</strong> {event.organizer}</span>
                </div>
              )}
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Event Overview</h4>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                {event.description}
              </p>
            </div>

            {/* Collaborating Clubs */}
            {event.collaborators && event.collaborators.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-[#D7B65A]" />
                  <span>Participating / Collaborating Entities</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {event.collaborators.map((c, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-slate-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {event.tags.map((t, idx) => (
                  <span key={idx} className="inline-flex items-center space-x-1 text-[11px] text-slate-400">
                    <Tag className="w-3 h-3 text-[#D7B65A]" />
                    <span>#{t}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Official Source Link */}
            {event.source?.url && (
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Official Social Record</span>
                <a
                  href={event.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#D7B65A] hover:underline"
                >
                  <span>View Original {event.source.platform} Post</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
