import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Share2,
  Check,
  ShieldCheck,
  ExternalLink,
  Users,
  Tag,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { getPublishedEventBySlug } from '../services/events';
import { EVENTS } from '../data/events';
import type { Event as PublicEvent } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';
import { SEO } from './SEO';
import { SITE_CONFIG, getAbsoluteImageUrl } from '../config/site';

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

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!slug) return;

    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        // 1. Try fetching from Supabase
        const dbEvent = await getPublishedEventBySlug(slug!);
        if (isMounted && dbEvent) {
          setEvent(mapDbEventToPublicEvent(dbEvent));
          return;
        }

        // 2. Fallback to static verified events
        const staticEvent = EVENTS.find((e) => e.slug === slug);
        if (isMounted) {
          setEvent(staticEvent || null);
        }
      } catch (err) {
        console.warn('Could not fetch event from database, trying static fallback:', err);
        const staticEvent = EVENTS.find((e) => e.slug === slug);
        if (isMounted) {
          setEvent(staticEvent || null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error('Failed to copy share link:', e);
    }
  };

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

  // Safe external URL check
  const safeSourceUrl = (url?: string): string | null => {
    if (!url) return null;
    const lower = url.trim().toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      return url.trim();
    }
    return null;
  };

  // Structured Data Schema for Event
  const eventJsonLd = event
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.shortDescription || event.description,
        ...(event.date ? { startDate: new Date(event.date).toISOString() } : {}),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: event.location || 'Coimbatore, Tamil Nadu',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Coimbatore',
            addressRegion: 'Tamil Nadu',
            addressCountry: 'IN',
          },
        },
        image: getAbsoluteImageUrl(event.image),
        organizer: {
          '@type': 'Organization',
          name: event.organizer || SITE_CONFIG.name,
          url: SITE_CONFIG.siteUrl,
        },
      }
    : undefined;

  const relatedEvents = event
    ? EVENTS.filter((e) => e.slug !== event.slug)
        .sort((a, _b) => (a.category === event.category ? -1 : 1))
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#D7B65A]/30 selection:text-[#E8D89A] flex flex-col">
      {/* Event SEO */}
      <SEO
        title={
          loading
            ? 'Loading Event...'
            : event
              ? `${event.title} — Event Record`
              : 'Event Not Found'
        }
        description={
          event
            ? `${event.title}${event.subtitle ? ` — ${event.subtitle}` : ''}. ${
                event.shortDescription || event.description
              } Rotaract Club of Lead India Ahead.`
            : 'Explore verified club initiatives, installations, and service projects of the Rotaract Club of Lead India Ahead.'
        }
        canonicalPath={event ? `/events/${event.slug}` : undefined}
        ogImage={event?.image || null}
        noindex={!loading && !event}
        jsonLd={eventJsonLd}
      />

      {/* Top Navbar */}
      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 hover:text-[#D7B65A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Events &amp; Initiatives
            </Link>
            <span>/</span>
            <span className="text-slate-500 truncate max-w-[240px]">
              {event ? event.title : 'Event Record'}
            </span>
          </div>

          {loading ? (
            <div className="glass-panel rounded-3xl p-12 border border-white/10 bg-[#0c192e]/40 animate-pulse space-y-6">
              <div className="h-8 bg-white/10 rounded-xl w-2/3" />
              <div className="h-4 bg-white/5 rounded-lg w-1/3" />
              <div className="h-64 bg-white/5 rounded-2xl" />
            </div>
          ) : !event ? (
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/40 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white">Event Record Not Found</h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                The requested event record could not be found or may have been archived. Please explore our verified activities on the main showcase.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] font-bold text-xs hover:brightness-110 transition-all shadow-md shadow-[#D7B65A]/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Explore All Events
                </Link>
                <Link
                  to="/careers"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-colors"
                >
                  View Opportunities
                </Link>
              </div>
            </div>
          ) : (
            <article className="space-y-8">
              {/* Event Hero Card */}
              <div className="glass-panel rounded-3xl border border-white/10 bg-gradient-to-br from-[#10233D]/90 via-[#0c192e]/90 to-[#07111F] overflow-hidden shadow-2xl">
                {/* Visual Banner */}
                {event.image && (
                  <div className="relative h-64 sm:h-96 w-full overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c192e] via-[#0c192e]/40 to-transparent" />
                  </div>
                )}

                <div className="p-6 sm:p-10 space-y-6">
                  {/* Top Badges & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          roleStyles[event.liaRole] || 'text-white bg-white/10 border-white/20'
                        }`}
                      >
                        {roleLabel[event.liaRole] || event.liaRole}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D7B65A]/15 text-[#E8D89A] border border-[#D7B65A]/30">
                        {event.category}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                        Year {event.year}
                      </span>
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Link Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Event</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-2">
                    <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                      {event.title}
                    </h1>
                    {event.subtitle && (
                      <p className="text-base sm:text-xl font-semibold text-[#D7B65A]">
                        {event.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Date & Location Pill Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#D7B65A]/15 border border-[#D7B65A]/30 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-[#D7B65A]" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                          Official Date
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {event.displayDate || event.date || 'Scheduled'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-[#06B6D4]" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
                          Venue / Location
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {event.location || 'Coimbatore, Tamil Nadu'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                      Official Event Record &amp; Summary
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {event.description || event.shortDescription}
                    </p>
                  </div>

                  {/* Collaborators */}
                  {event.collaborators && event.collaborators.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#D7B65A]" />
                        Collaborators &amp; Partners
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {event.collaborators.map((partner, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-200"
                          >
                            {partner}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#D7B65A]" />
                        Avenues &amp; Topics
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#D7B65A]/10 border border-[#D7B65A]/25 text-[#E8D89A]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verified Source / Press Coverage */}
                  {event.source && safeSourceUrl(event.source.url) && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Verified Source: {event.source.platform}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Documented club record with external verification
                          </p>
                        </div>
                      </div>

                      <a
                        href={safeSourceUrl(event.source.url)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        <span>View Publication</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#D7B65A]" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )}

          {/* Related Events Section */}
          {!loading && event && relatedEvents.length > 0 && (
            <section className="pt-8 border-t border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#D7B65A] mb-1">
                    More From Rotaract LIA
                  </h2>
                  <h3 className="font-heading font-bold text-xl text-white">
                    Related Events &amp; Initiatives
                  </h3>
                </div>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D7B65A] hover:text-[#E8D89A] transition-colors"
                >
                  <span>View All Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedEvents.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/events/${rel.slug}`}
                    className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-white/10 group flex flex-col justify-between"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={rel.image || '/assets/events/the-one.jpg'}
                        alt={rel.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-300">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-[#D7B65A]" />
                          <span>{rel.displayDate}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-[#D7B65A]">
                          {rel.category}
                        </div>
                        <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#E8D89A] transition-colors line-clamp-1">
                          {rel.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {rel.shortDescription || rel.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-[#D7B65A]">
                        <span>Explore Record</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Global Join Modal */}
      <JoinUs
        isModalOpen={isJoinModalOpen}
        onCloseModal={() => setIsJoinModalOpen(false)}
        onOpenModal={() => setIsJoinModalOpen(true)}
      />

      {/* Footer */}
      <Footer onOpenJoinModal={() => setIsJoinModalOpen(true)} />
    </div>
  );
};
