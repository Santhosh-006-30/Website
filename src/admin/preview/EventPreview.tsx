import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Calendar, MapPin, Tag, Users, Shield, 
  ExternalLink, Eye, AlertTriangle 
} from 'lucide-react';
import { adminGetEvent, adminGetEventImages } from '../../services/events';
import type { Event, EventImage } from '../../types/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const EventPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [images, setImages] = useState<EventImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [eventData, imgData] = await Promise.all([
          adminGetEvent(id),
          adminGetEventImages(id),
        ]);
        setEvent(eventData);
        setImages(imgData);
      } catch (err: any) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 text-sm mt-3">Loading event preview...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-100">Event Not Found</h2>
        <p className="text-slate-400 text-sm mt-1">{error || 'The requested event could not be found.'}</p>
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
      </div>
    );
  }

  const isDraft = event.status === 'draft';
  const isArchived = event.status === 'archived';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md sticky top-4 z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/events')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to CMS
          </button>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Live Preview
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            event.status === 'published'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : event.status === 'draft'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
          }`}>
            {event.status.toUpperCase()}
          </span>

          <Link
            to={`/admin/events/${event.id}/edit`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Event
          </Link>
        </div>
      </div>

      {/* Draft Warning Banner */}
      {(isDraft || isArchived) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block mb-0.5">
              PREVIEW MODE — THIS CONTENT IS {event.status.toUpperCase()}
            </span>
            This page is only visible to logged-in administrators and is not publicly visible on the live website.
          </div>
        </div>
      )}

      {/* Preview Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Cover Image */}
        {event.cover_image_url && (
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold rounded-full uppercase tracking-wider">
              {event.category}
            </span>
            {event.lia_role && (
              <span className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-full">
                {event.lia_role}
              </span>
            )}
            {event.featured && (
              <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-full">
                ⭐ Featured
              </span>
            )}
            {event.year && (
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-full">
                {event.year}
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 leading-tight">
              {event.title}
            </h1>
            {event.subtitle && (
              <p className="text-base text-slate-400 mt-2 font-medium">
                {event.subtitle}
              </p>
            )}
          </div>

          {/* Key Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 border-y border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {event.display_date || (event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Date TBD')}
                {event.start_time && ` • ${event.start_time}`}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {[event.venue, event.city].filter(Boolean).join(', ') || 'Venue details coming soon'}
              </span>
            </div>

            {event.organizer && (
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Organizer: <strong className="text-slate-200">{event.organizer}</strong></span>
              </div>
            )}

            {event.collaborators && event.collaborators.length > 0 && (
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Collaborators: <strong className="text-slate-200">{event.collaborators.join(', ')}</strong></span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              About This Event
            </h3>
            <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-line">
              {event.description || event.short_description || 'No description provided.'}
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {event.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs rounded-lg"
                  >
                    <Tag className="w-3 h-3 text-slate-500" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Event Images Gallery */}
          {images.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Photo Gallery ({images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group"
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption || 'Event image'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-sm p-1.5 text-[11px] text-slate-300 truncate">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social / External Links */}
          {(event.instagram_url || event.linkedin_url || event.external_url) && (
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800 text-xs">
              {event.instagram_url && (
                <a
                  href={event.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Instagram Post
                </a>
              )}
              {event.linkedin_url && (
                <a
                  href={event.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> LinkedIn Post
                </a>
              )}
              {event.external_url && (
                <a
                  href={event.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> External Link
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
