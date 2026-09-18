import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, ArrowUpRight, ShieldCheck, Filter } from "lucide-react";
import { EVENTS } from "../data/events";
import type { Event } from "../types";
import { EventModal } from "./EventModal";
import { getPublishedEvents } from "../services/events";

function mapSupabaseEventToPublicEvent(dbEvent: any): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    subtitle: dbEvent.subtitle || undefined,
    slug: dbEvent.slug,
    date: dbEvent.event_date || undefined,
    displayDate: dbEvent.display_date || dbEvent.event_date || undefined,
    year: dbEvent.year || new Date(dbEvent.event_date || Date.now()).getFullYear(),
    category: dbEvent.category || "General",
    status: (dbEvent.status === "published" ? "completed" : "upcoming") as any,
    location: dbEvent.venue || dbEvent.city || undefined,
    description: dbEvent.description || "",
    shortDescription: dbEvent.short_description || dbEvent.description || "",
    image: dbEvent.cover_image_url || undefined,
    featured: Boolean(dbEvent.featured),
    organizerType: dbEvent.organizer_type || "LIA",
    liaRole: dbEvent.lia_role || "ORGANIZER",
    organizer: dbEvent.organizer || undefined,
    collaborators: dbEvent.collaborators || [],
    tags: dbEvent.tags || [],
    source: dbEvent.source_platform ? {
      platform: dbEvent.source_platform as any,
      url: dbEvent.source_url || undefined,
      verified: Boolean(dbEvent.source_verified),
    } : undefined,
  };
}

export const Events = () => {
  const [eventsList, setEventsList] = useState<Event[]>(EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    let isMounted = true;
    getPublishedEvents()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setEventsList(data.map(mapSupabaseEventToPublicEvent));
        }
      })
      .catch((err) => {
        console.warn("Could not load events from database, using static fallback:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filterOptions = [
    { label: "ALL", value: "ALL" },
    { label: "2026–27", value: "2026" },
    { label: "2025–26", value: "2025" },
    { label: "LEADERSHIP", value: "LEADERSHIP" },
    { label: "SPORTS", value: "SPORTS" },
    { label: "HEALTH", value: "HEALTH" },
    { label: "PROFESSIONAL DEV", value: "PROFESSIONAL DEVELOPMENT" },
    { label: "DISTRICT EVENTS", value: "DISTRICT EVENTS" },
  ];

  const filteredEvents = eventsList.filter((ev) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "2026") return ev.year === 2026;
    if (activeFilter === "2025") return ev.year === 2025;
    return ev.category.toUpperCase().includes(activeFilter);
  });

  const featuredEvent = eventsList.find((e) => e.featured && e.id.includes("the-one")) || eventsList.find((e) => e.featured) || eventsList[0];

  return (
    <section id="events" className="py-24 bg-[#07111F] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-3">
              <span>Verified Club Activities</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              EVENTS &amp; <span className="gold-gradient-text">INITIATIVES</span>
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="max-w-md text-slate-400 text-sm sm:text-base font-normal">
              Chronological records of verified club installations, district seminars, youth sports tournaments, and public health initiatives.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#D7B65A] border border-[#D7B65A]/30 shrink-0 transition-colors"
            >
              <span>Explore All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Featured Event Spotlight: THE ONE */}
        {featuredEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onClick={() => setSelectedEvent(featuredEvent)}
            className="mb-14 glass-card rounded-3xl overflow-hidden border border-[#D7B65A]/30 group cursor-pointer hover:shadow-2xl transition-all relative"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 relative h-56 sm:h-72 lg:h-96 overflow-hidden">
                <img
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#07111F]/90 via-[#07111F]/30 lg:via-transparent to-transparent lg:to-[#07111F]" />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#D7B65A] text-[#07111F] shadow-lg">
                    Featured Installation
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#07111F]/80 text-[#E8D89A] border border-[#D7B65A]/40 backdrop-blur-md">
                    Rotary Year 2026–27
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-5 sm:p-8 lg:p-10 space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-4 h-4 text-[#D7B65A]" />
                  <span className="font-semibold text-white">{featuredEvent.displayDate}</span>
                  <span>•</span>
                  <span>{featuredEvent.location}</span>
                </div>

                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white group-hover:text-[#E8D89A] transition-colors leading-tight">
                  {featuredEvent.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-[#D7B65A]">
                  {featuredEvent.subtitle}
                </p>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  {featuredEvent.shortDescription}
                </p>

                <div className="pt-3 sm:pt-4 flex items-center justify-between text-xs font-semibold text-white border-t border-white/10">
                  <span className="flex items-center space-x-1.5 text-[#10B981] text-[11px] sm:text-xs">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="truncate">LIA Organized • Afternoon Newspaper Featured</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#D7B65A] group-hover:text-[#07111F] flex items-center justify-center transition-colors shrink-0 ml-2">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 sm:mb-10 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Filter className="w-3.5 h-3.5 text-[#D7B65A]" />
            <span>Filter Events</span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                  activeFilter === f.value
                    ? "bg-[#D7B65A] text-[#07111F] font-bold shadow-md shadow-[#D7B65A]/20"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEvents.map((ev) => {
              const roleStyles: Record<string, string> = {
                ORGANIZER: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30",
                CO_ORGANIZER: "text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30",
                PARTICIPANT: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30",
                REPRESENTATIVE: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30",
              };
              const roleLabel: Record<string, string> = {
                ORGANIZER: "LIA Organized",
                CO_ORGANIZER: "Joint Event",
                PARTICIPANT: "Participation",
                REPRESENTATIVE: "District Rep",
              };

              return (
                <motion.div
                  layout
                  key={ev.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedEvent(ev)}
                  className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-white/10 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={ev.image || "/assets/events/the-one.jpg"}
                      alt={ev.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${roleStyles[ev.liaRole] || "text-white bg-white/10"}`}>
                        {roleLabel[ev.liaRole] || ev.liaRole}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D7B65A]" />
                        <span>{ev.displayDate}</span>
                      </span>
                      {ev.location && (
                        <span className="flex items-center space-x-1 truncate max-w-[150px]">
                          <MapPin className="w-3 h-3 text-[#06B6D4]" />
                          <span>{ev.location.split(",")[0]}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#D7B65A] mb-1">
                        {ev.category}
                      </div>

                      <h4 className="font-heading font-bold text-xl text-white mb-2 group-hover:text-[#E8D89A] transition-colors leading-snug">
                        {ev.title}
                      </h4>

                      <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-3 mb-4">
                        {ev.shortDescription}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white">
                      <span>View Event Record</span>
                      <ArrowUpRight className="w-4 h-4 text-[#D7B65A]" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Event Details Dialog */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
};
