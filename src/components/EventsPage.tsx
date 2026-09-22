import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  ShieldCheck,
  Tag,
  LayoutGrid,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { EVENTS } from '../data/events';
import type { Event as PublicEvent } from '../types';
import { getPublishedEvents } from '../services/events';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';
import { SEO } from './SEO';
import { SITE_CONFIG, getCanonicalUrl } from '../config/site';

// ─── Lightweight Calendar Component ─────────────────────────────────────────
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

interface CalendarViewProps {
  events: PublicEvent[];
  onSelectDate: (dateStr: string | null) => void;
  selectedDate: string | null;
}

const EventCalendarView: React.FC<CalendarViewProps> = ({ events, onSelectDate, selectedDate }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  // Build a map of date -> events for quick lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, PublicEvent[]>();
    for (const ev of events) {
      if (!ev.date) continue;
      const key = ev.date.slice(0, 10); // YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  // Grid cells: blank cells for leading days + days of month
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleDayClick = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mm}-${dd}`;
    onSelectDate(selectedDate === dateStr ? null : dateStr);
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 bg-[#0c192e]/60 overflow-hidden shadow-xl">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="font-heading font-bold text-sm sm:text-base text-white tracking-wide">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h2>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-white/5">
        {DAY_NAMES.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-white/5 p-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`blank-${idx}`} className="bg-[#07111F]/60 rounded-lg h-12 sm:h-14" />;
          }
          const mm = String(viewMonth + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const dateStr = `${viewYear}-${mm}-${dd}`;
          const dayEvents = eventsByDate.get(dateStr) || [];
          const hasEvents = dayEvents.length > 0;
          const isSelected = selectedDate === dateStr;
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();

          return (
            <button
              key={dateStr}
              onClick={() => hasEvents && handleDayClick(day)}
              disabled={!hasEvents}
              aria-label={`${day} ${MONTH_NAMES[viewMonth]}${hasEvents ? `, ${dayEvents.length} event(s)` : ''}`}
              className={`relative flex flex-col items-center justify-start pt-1.5 h-12 sm:h-14 rounded-lg transition-all text-xs font-medium
                ${isSelected ? 'bg-[#D7B65A]/20 border border-[#D7B65A]/50 text-[#E8D89A]' : ''}
                ${!isSelected && hasEvents ? 'bg-white/[0.03] hover:bg-white/10 text-white cursor-pointer' : ''}
                ${!hasEvents ? 'bg-transparent text-slate-600 cursor-default' : ''}
                ${isToday && !isSelected ? 'ring-1 ring-[#06B6D4]/60' : ''}
              `}
            >
              <span className={`text-[11px] font-semibold ${isToday ? 'text-[#06B6D4]' : ''}`}>{day}</span>
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-1">
                  {dayEvents.slice(0, 3).map((_, i) => (
                    <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#D7B65A]' : 'bg-[#D7B65A]/70'}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-6 py-3 flex items-center gap-4 text-[10px] text-slate-500 border-t border-white/5">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D7B65A]/70" />
          Has event(s)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-[#06B6D4]/60 bg-transparent" />
          Today
        </span>
      </div>
    </div>
  );
};

function mapDbEventToPublicEvent(dbEvent: any): PublicEvent {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    subtitle: dbEvent.subtitle || undefined,
    slug: dbEvent.slug,
    date: dbEvent.event_date || undefined,
    displayDate: dbEvent.display_date || dbEvent.event_date || undefined,
    year: dbEvent.year || new Date(dbEvent.event_date || Date.now()).getFullYear(),
    category: dbEvent.category || 'General',
    status: (dbEvent.status === 'published' ? 'completed' : 'upcoming') as any,
    location: dbEvent.venue || dbEvent.city || undefined,
    description: dbEvent.description || '',
    shortDescription: dbEvent.short_description || dbEvent.description || '',
    image: dbEvent.cover_image_url || undefined,
    featured: Boolean(dbEvent.featured),
    organizerType: dbEvent.organizer_type || 'LIA',
    liaRole: dbEvent.lia_role || 'ORGANIZER',
    organizer: dbEvent.organizer || undefined,
    collaborators: dbEvent.collaborators || [],
    tags: dbEvent.tags || [],
    source: dbEvent.source_platform
      ? {
          platform: dbEvent.source_platform as any,
          url: dbEvent.source_url || undefined,
          verified: Boolean(dbEvent.source_verified),
        }
      : undefined,
  };
}

export const EventsPage: React.FC = () => {
  const [eventsList, setEventsList] = useState<PublicEvent[]>(EVENTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    let isMounted = true;
    getPublishedEvents()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setEventsList(data.map(mapDbEventToPublicEvent));
        }
      })
      .catch((err) => {
        console.warn('Could not load events from database, using verified fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Events & Initiatives | Rotaract Club of Lead India Ahead',
    description:
      'Chronological records of verified club installations, district seminars, youth sports tournaments, and public health initiatives under MAAYON 2026–27.',
    url: getCanonicalUrl('/events'),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.siteUrl,
    },
  };

  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      const matchesSearch =
        !search.trim() ||
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        (ev.subtitle && ev.subtitle.toLowerCase().includes(search.toLowerCase())) ||
        (ev.description && ev.description.toLowerCase().includes(search.toLowerCase())) ||
        (ev.location && ev.location.toLowerCase().includes(search.toLowerCase())) ||
        (ev.tags && ev.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

      const matchesCategory =
        selectedCategory === 'ALL' ||
        ev.category.toUpperCase().includes(selectedCategory);

      const matchesYear =
        selectedYear === 'ALL' ||
        String(ev.year) === selectedYear;

      const matchesDate =
        !selectedDate ||
        (ev.date && ev.date.slice(0, 10) === selectedDate);

      return matchesSearch && matchesCategory && matchesYear && matchesDate;
    });
  }, [eventsList, search, selectedCategory, selectedYear, selectedDate]);

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Leadership', value: 'LEADERSHIP' },
    { label: 'Sports', value: 'SPORTS' },
    { label: 'Health', value: 'HEALTH' },
    { label: 'Professional Dev', value: 'PROFESSIONAL DEVELOPMENT' },
    { label: 'District Events', value: 'DISTRICT EVENTS' },
  ];

  const years = [
    { label: 'All Years', value: 'ALL' },
    { label: '2026–27', value: '2026' },
    { label: '2025–26', value: '2025' },
  ];

  const roleStyles: Record<string, string> = {
    ORGANIZER: 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40',
    CO_ORGANIZER: 'text-[#06B6D4] bg-[#06B6D4]/15 border-[#06B6D4]/40',
    PARTICIPANT: 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/40',
    REPRESENTATIVE: 'text-[#8B5CF6] bg-[#8B5CF6]/15 border-[#8B5CF6]/40',
  };

  const roleLabel: Record<string, string> = {
    ORGANIZER: 'LIA Organized',
    CO_ORGANIZER: 'Joint Collaboration',
    PARTICIPANT: 'Club Participation',
    REPRESENTATIVE: 'District Representation',
  };

  const featuredEvent = eventsList.find((e) => e.featured) || eventsList[0];

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#D7B65A]/30 selection:text-[#E8D89A] flex flex-col">
      <SEO
        title="Events & Initiatives — Rotaract Club of Lead India Ahead"
        description="Explore verified installations, district youth leadership seminars, youth sports cups, and public health initiatives organized and supported by Rotaract LIA."
        canonicalPath="/events"
        jsonLd={collectionJsonLd}
      />

      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider">
              <span>Official Event Archive</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              EVENTS &amp; <span className="gold-gradient-text">INITIATIVES</span>
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
              Explore authentic documentation, media coverage, and verified records of all Rotary Year installations, community initiatives, and district representations.
            </p>
          </div>

          {/* Featured Spotlight: THE ONE */}
          {featuredEvent && !search && selectedCategory === 'ALL' && selectedYear === 'ALL' && (
            <div className="glass-panel rounded-3xl border border-[#D7B65A]/30 bg-gradient-to-br from-[#10233D]/95 via-[#0c192e]/90 to-[#07111F] overflow-hidden shadow-2xl relative group">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto overflow-hidden">
                  <img
                    src={featuredEvent.image || '/assets/events/the-one.jpg'}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#07111F]/30 to-[#07111F]" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#07111F]/80 text-[#D7B65A] border border-[#D7B65A]/40 backdrop-blur-md">
                      Featured Milestone
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Record
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#D7B65A] font-semibold uppercase tracking-wider">
                      <span>{featuredEvent.category}</span>
                      <span>•</span>
                      <span>{featuredEvent.displayDate}</span>
                    </div>

                    <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white group-hover:text-[#E8D89A] transition-colors">
                      {featuredEvent.title}
                    </h2>

                    {featuredEvent.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-300 font-medium">
                        {featuredEvent.subtitle}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                      {featuredEvent.shortDescription || featuredEvent.description}
                    </p>

                    {featuredEvent.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-2">
                        <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
                        <span>{featuredEvent.location}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      to={`/events/${featuredEvent.slug}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer"
                    >
                      <span>Explore Event Record</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 bg-[#0c192e]/40 space-y-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="Search events"
                  placeholder="Search events by title, keyword, location, tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#D7B65A]/50 transition-colors"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <select
                  aria-label="Filter events by category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0c192e] border border-white/10 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#D7B65A]/50 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value} className="bg-[#07111F] text-slate-200">
                      {c.label}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter events by year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0c192e] border border-white/10 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#D7B65A]/50 cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y.value} value={y.value} className="bg-[#07111F] text-slate-200">
                      {y.label}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex rounded-xl border border-white/10 overflow-hidden shrink-0" role="group" aria-label="Event view mode">
                  <button
                    id="view-grid-btn"
                    onClick={() => { setViewMode('grid'); setSelectedDate(null); }}
                    aria-pressed={viewMode === 'grid'}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[#D7B65A]/20 text-[#E8D89A] border-r border-[#D7B65A]/30'
                        : 'bg-transparent text-slate-400 hover:text-white border-r border-white/10'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    id="view-calendar-btn"
                    onClick={() => setViewMode('calendar')}
                    aria-pressed={viewMode === 'calendar'}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                      viewMode === 'calendar'
                        ? 'bg-[#D7B65A]/20 text-[#E8D89A]'
                        : 'bg-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Calendar</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                {selectedDate && <span className="ml-1.5 text-[#D7B65A]">for {selectedDate}</span>}
              </span>
              {(search || selectedCategory !== 'ALL' || selectedYear !== 'ALL' || selectedDate) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('ALL');
                    setSelectedYear('ALL');
                    setSelectedDate(null);
                  }}
                  className="text-[#D7B65A] hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <EventCalendarView
              events={eventsList}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
          )}

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/30 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-[#D7B65A]">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {selectedDate ? `No events on ${selectedDate}` : 'No events match your criteria'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {selectedDate
                  ? 'Select another date on the calendar or clear filters to see all events.'
                  : 'Try adjusting your search terms or clearing selected category and year filters.'}
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('ALL');
                  setSelectedYear('ALL');
                  setSelectedDate(null);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D7B65A] border border-[#D7B65A]/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredEvents.map((ev) => (
                  <motion.div
                    layout
                    key={ev.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-white/10 group flex flex-col justify-between"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={ev.image || '/assets/events/the-one.jpg'}
                        alt={ev.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${
                            roleStyles[ev.liaRole] || 'text-white bg-white/10'
                          }`}
                        >
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
                            <span>{ev.location.split(',')[0]}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#D7B65A] mb-1">
                          {ev.category}
                        </div>

                        <h3 className="font-heading font-bold text-lg sm:text-xl text-white mb-2 group-hover:text-[#E8D89A] transition-colors leading-snug">
                          {ev.title}
                        </h3>

                        <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-3">
                          {ev.shortDescription || ev.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {ev.tags?.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 text-[9px] rounded bg-white/5 text-slate-400 border border-white/5 flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5 text-[#D7B65A]" />
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>

                        <Link
                          to={`/events/${ev.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#D7B65A] hover:text-[#E8D89A] transition-colors group-hover:translate-x-0.5 transform duration-200"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <JoinUs
        isModalOpen={isJoinModalOpen}
        onCloseModal={() => setIsJoinModalOpen(false)}
        onOpenModal={() => setIsJoinModalOpen(true)}
      />

      <Footer onOpenJoinModal={() => setIsJoinModalOpen(true)} />
    </div>
  );
};
