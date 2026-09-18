import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  Star,
  Briefcase,
  MapPin,
  Clock,
  Building2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  adminGetCareers,
  adminDeleteCareer,
  adminPublishCareer,
  adminUnpublishCareer,
  adminArchiveCareer,
  adminUpdateCareer,
} from '../../services/careers';
import type { Career, CareerStatus } from '../../types/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../shared/StatusBadge';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TableSkeleton } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { showToast } from '../shared/Toast';

export const CareersManager: React.FC = () => {
  const navigate = useNavigate();
  const { canDelete, canWrite } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CareerStatus | 'all'>('all');
  const [opportunityType, setOpportunityType] = useState<string>('all');
  const [workMode, setWorkMode] = useState<string>('all');

  // Modal / Confirm state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingStatusCareer, setPendingStatusCareer] = useState<{
    career: Career;
    targetStatus: 'published' | 'draft' | 'archived';
  } | null>(null);

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetCareers({
        page: currentPage,
        pageSize,
        status: statusFilter,
        search: search.trim() || undefined,
        opportunityType: opportunityType !== 'all' ? opportunityType : undefined,
        workMode: workMode !== 'all' ? workMode : undefined,
      });
      setCareers(res.data);
      setTotalCount(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to fetch careers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, search, opportunityType, workMode]);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCareers();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDeleteCareer(deleteId);
      showToast.success('Opportunity deleted successfully');
      setDeleteId(null);
      fetchCareers();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to delete opportunity');
    } finally {
      setDeleting(false);
    }
  };

  const executeStatusChange = async () => {
    if (!pendingStatusCareer) return;
    const { career, targetStatus } = pendingStatusCareer;
    try {
      if (targetStatus === 'published') {
        await adminPublishCareer(career.id);
        showToast.success(`"${career.title}" published`);
      } else if (targetStatus === 'archived') {
        await adminArchiveCareer(career.id);
        showToast.success(`"${career.title}" archived`);
      } else {
        await adminUnpublishCareer(career.id);
        showToast.success(`"${career.title}" moved to draft`);
      }
      fetchCareers();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update status');
    } finally {
      setPendingStatusCareer(null);
    }
  };

  const handleToggleStatus = (career: Career) => {
    const nextStatus = career.status === 'published' ? 'draft' : 'published';
    setPendingStatusCareer({ career, targetStatus: nextStatus });
  };

  const handleArchive = (career: Career) => {
    setPendingStatusCareer({ career, targetStatus: 'archived' });
  };

  const handleToggleFeatured = async (career: Career) => {
    try {
      await adminUpdateCareer(career.id, { featured: !career.featured });
      showToast.success(
        career.featured
          ? `Removed "${career.title}" from featured`
          : `Marked "${career.title}" as featured`
      );
      fetchCareers();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update featured status');
    }
  };

  const isExpired = (career: Career) => {
    if (!career.application_deadline) return false;
    return new Date(career.application_deadline) < new Date();
  };

  const formatDeadline = (deadlineStr: string | null) => {
    if (!deadlineStr) return 'Rolling basis';
    const d = new Date(deadlineStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-[#D7B65A]" />
            Careers & Opportunities
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Publish and manage genuine job, internship, fellowship, and volunteer opportunities
          </p>
        </div>

        {canWrite && (
          <Link
            to="/admin/careers/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Opportunity
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0c192e]/60 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, organization, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 transition-colors"
          />
        </form>

        {/* Dropdown Filters & Status Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Opportunity Type Filter */}
          <select
            value={opportunityType}
            onChange={(e) => {
              setOpportunityType(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D7B65A]/60"
          >
            <option value="all">All Types</option>
            <option value="job">Job</option>
            <option value="internship">Internship</option>
            <option value="volunteer">Volunteer</option>
            <option value="project_role">Project Role</option>
            <option value="fellowship">Fellowship</option>
            <option value="other">Other</option>
          </select>

          {/* Work Mode Filter */}
          <select
            value={workMode}
            onChange={(e) => {
              setWorkMode(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D7B65A]/60"
          >
            <option value="all">All Modes</option>
            <option value="on_site">On-Site</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['all', 'published', 'draft', 'archived'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
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
      </div>

      {/* Careers Table */}
      <div className="glass-panel rounded-2xl border border-white/10 bg-[#0c192e]/40 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : careers.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No opportunities found"
            description={
              search || statusFilter !== 'all' || opportunityType !== 'all' || workMode !== 'all'
                ? 'Try adjusting your search or filters to find what you are looking for.'
                : 'No opportunities created yet. Add the first one!'
            }
            actionLabel={canWrite ? 'Add Opportunity' : undefined}
            onAction={canWrite ? () => navigate('/admin/careers/new') : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#07111F]/70 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Opportunity</th>
                  <th className="py-3.5 px-4 font-semibold">Type & Mode</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Deadline</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Featured</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {careers.map((career) => {
                  const expired = isExpired(career);
                  return (
                    <tr
                      key={career.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Opportunity Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {career.organization_logo_url ? (
                            <img
                              src={career.organization_logo_url}
                              alt={career.organization_name}
                              className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1 border border-white/10 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 flex-shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/admin/careers/${career.id}/edit`}
                              className="font-semibold text-white group-hover:text-[#D7B65A] transition-colors line-clamp-1"
                            >
                              {career.title}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span className="text-slate-300 font-medium">
                                {career.organization_name}
                              </span>
                              <span className="font-mono text-[11px] text-slate-500">
                                /{career.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Mode */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-xs bg-[#D7B65A]/10 text-[#D7B65A] border border-[#D7B65A]/20 px-2.5 py-0.5 rounded-full font-medium capitalize">
                            {career.opportunity_type.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {career.work_mode.replace('_', '-')}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-slate-300 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[140px]">
                            {career.location || (career.work_mode === 'remote' ? 'Remote' : 'Unspecified')}
                          </span>
                        </div>
                        {career.remuneration && (
                          <div className="text-emerald-400 text-[11px] mt-0.5 font-medium truncate max-w-[140px]">
                            {career.remuneration}
                          </div>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-300">
                            {formatDeadline(career.application_deadline)}
                          </span>
                        </div>
                        {expired && career.status === 'published' && (
                          <div className="inline-flex items-center gap-1 mt-1 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-medium">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Expired
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={career.status} />
                      </td>

                      {/* Featured */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(career)}
                          disabled={!canWrite}
                          title={career.featured ? 'Remove from featured' : 'Mark as featured'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            career.featured
                              ? 'text-[#D7B65A] hover:bg-[#D7B65A]/10'
                              : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${career.featured ? 'fill-[#D7B65A]' : ''}`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Preview Button */}
                          <Link
                            to={`/admin/preview/career/${career.id}`}
                            title="Preview Opportunity"
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-cyan-400" />
                          </Link>

                          {/* Status Toggle Button */}
                          {canWrite && (
                            <button
                              onClick={() => handleToggleStatus(career)}
                              title={career.status === 'published' ? 'Move to Draft' : 'Publish'}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            >
                              {career.status === 'published' ? (
                                <EyeOff className="w-4 h-4 text-amber-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-emerald-400" />
                              )}
                            </button>
                          )}

                          {/* Archive Button */}
                          {canWrite && career.status !== 'archived' && (
                            <button
                              onClick={() => handleArchive(career)}
                              title="Archive"
                              className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Button */}
                          {canWrite && (
                            <Link
                              to={`/admin/careers/${career.id}/edit`}
                              title="Edit"
                              className="p-1.5 text-slate-400 hover:text-[#D7B65A] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Delete Button (super_admin / admin only) */}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteId(career.id)}
                              title="Delete"
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 bg-[#07111F]/50">
            <div>
              Showing <span className="text-white font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="text-white font-medium">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{' '}
              of <span className="text-white font-medium">{totalCount}</span> opportunities
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Opportunity"
        message="Are you sure you want to permanently delete this opportunity? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Confirm Status Change Dialog */}
      <ConfirmDialog
        isOpen={Boolean(pendingStatusCareer)}
        title={
          pendingStatusCareer?.targetStatus === 'published'
            ? 'Publish Opportunity'
            : pendingStatusCareer?.targetStatus === 'archived'
            ? 'Archive Opportunity'
            : 'Move to Draft'
        }
        message={
          pendingStatusCareer?.targetStatus === 'published'
            ? `Make "${pendingStatusCareer.career.title}" visible on the public website?`
            : pendingStatusCareer?.targetStatus === 'archived'
            ? `Archive "${pendingStatusCareer?.career.title}"? It will no longer be visible publicly.`
            : `Move "${pendingStatusCareer?.career.title}" to draft? It will be hidden from the public website.`
        }
        confirmLabel={
          pendingStatusCareer?.targetStatus === 'published'
            ? 'Publish'
            : pendingStatusCareer?.targetStatus === 'archived'
            ? 'Archive'
            : 'Move to Draft'
        }
        confirmVariant={pendingStatusCareer?.targetStatus === 'published' ? 'primary' : 'warning'}
        onConfirm={executeStatusChange}
        onCancel={() => setPendingStatusCareer(null)}
      />
    </div>
  );
};
