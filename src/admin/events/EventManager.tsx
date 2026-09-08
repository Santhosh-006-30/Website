import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, Eye, EyeOff, 
  Archive, Star, Calendar, MapPin, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { 
  adminGetEvents, 
  adminDeleteEvent, 
  adminPublishEvent, 
  adminUnpublishEvent,
  adminArchiveEvent,
  adminUpdateEvent 
} from '../../services/events';
import type { Event, ContentStatus } from '../../types/supabase';
import { StatusBadge } from '../shared/StatusBadge';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TableSkeleton } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { showToast } from '../shared/Toast';

export const EventManager: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');

  // Modal / Confirm state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetEvents({
        page: currentPage,
        pageSize,
        status: statusFilter,
        search: search.trim() || undefined,
      });
      setEvents(res.data);
      setTotalCount(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDeleteEvent(deleteId);
      showToast.success('Event deleted successfully');
      setDeleteId(null);
      fetchEvents();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (event: Event) => {
    try {
      if (event.status === 'published') {
        await adminUnpublishEvent(event.id);
        showToast.success(`"${event.title}" unpublished`);
      } else {
        await adminPublishEvent(event.id);
        showToast.success(`"${event.title}" published`);
      }
      fetchEvents();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update status');
    }
  };

  const handleArchive = async (event: Event) => {
    try {
      await adminArchiveEvent(event.id);
      showToast.success(`"${event.title}" archived`);
      fetchEvents();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to archive event');
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    try {
      await adminUpdateEvent(event.id, { featured: !event.featured });
      showToast.success(
        event.featured 
          ? `Removed "${event.title}" from featured` 
          : `Marked "${event.title}" as featured`
      );
      fetchEvents();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update featured status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-[#D7B65A]" />
            Event Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, edit, organize and manage club events and photo galleries
          </p>
        </div>

        <Link
          to="/admin/events/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0c192e]/60 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 transition-colors"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'published', 'draft', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#D7B65A] text-[#07111F] shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel rounded-2xl border border-white/10 bg-[#0c192e]/40 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events found"
            description={
              search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you are looking for.'
                : 'You have not added any events yet. Create your first event now!'
            }
            actionLabel="Create Event"
            onAction={() => navigate('/admin/events/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#07111F]/70 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Event</th>
                  <th className="py-3.5 px-4 font-semibold">Date & Venue</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Featured</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Event Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {event.cover_image_url ? (
                          <img
                            src={event.cover_image_url}
                            alt={event.title}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 flex-shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/admin/events/${event.id}/edit`}
                            className="font-semibold text-white group-hover:text-[#D7B65A] transition-colors line-clamp-1"
                          >
                            {event.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-500">
                              /{event.slug}
                            </span>
                            {event.lia_role && (
                              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-amber-300">
                                {event.lia_role}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date & Venue */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-white text-xs font-medium">
                        {event.event_date}
                      </div>
                      <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[150px]">
                          {event.venue || 'No venue specified'}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs bg-[#D7B65A]/10 text-[#D7B65A] border border-[#D7B65A]/20 px-2.5 py-1 rounded-full font-medium">
                        {event.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={event.status} />
                    </td>

                    {/* Featured */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(event)}
                        title={event.featured ? 'Remove from featured' : 'Mark as featured'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          event.featured
                            ? 'text-[#D7B65A] hover:bg-[#D7B65A]/10'
                            : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${event.featured ? 'fill-[#D7B65A]' : ''}`} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleToggleStatus(event)}
                          title={event.status === 'published' ? 'Unpublish' : 'Publish'}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          {event.status === 'published' ? (
                            <EyeOff className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>

                        {/* Archive Button */}
                        {event.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(event)}
                            title="Archive"
                            className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <Link
                          to={`/admin/events/${event.id}/edit`}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-[#D7B65A] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteId(event.id)}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && events.length > 0 && (
          <div className="py-3.5 px-4 bg-[#07111F]/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-white">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-semibold text-white">{totalCount}</span> events
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Event"
        message="Are you sure you want to permanently delete this event? This action will also delete all associated photos and cannot be undone."
        confirmLabel="Delete Event"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
