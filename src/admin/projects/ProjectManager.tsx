import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, Eye, EyeOff, 
  Archive, Star, FolderGit2, ChevronLeft, ChevronRight, BarChart2 
} from 'lucide-react';
import { 
  adminGetProjects, 
  adminDeleteProject, 
  adminPublishProject, 
  adminArchiveProject,
  adminUpdateProject 
} from '../../services/projects';
import type { Project, ContentStatus } from '../../types/supabase';
import { StatusBadge } from '../shared/StatusBadge';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TableSkeleton } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { showToast } from '../shared/Toast';

export const ProjectManager: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetProjects({
        page: currentPage,
        pageSize,
        status: statusFilter,
        search: search.trim() || undefined,
      });
      setProjects(res.data);
      setTotalCount(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjects();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDeleteProject(deleteId);
      showToast.success('Project deleted successfully');
      setDeleteId(null);
      fetchProjects();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (project: Project) => {
    try {
      if (project.status === 'published') {
        await adminUpdateProject(project.id, { status: 'draft' });
        showToast.success(`"${project.title}" set to draft`);
      } else {
        await adminPublishProject(project.id);
        showToast.success(`"${project.title}" published`);
      }
      fetchProjects();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update status');
    }
  };

  const handleArchive = async (project: Project) => {
    try {
      await adminArchiveProject(project.id);
      showToast.success(`"${project.title}" archived`);
      fetchProjects();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to archive project');
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      await adminUpdateProject(project.id, { featured: !project.featured });
      showToast.success(
        project.featured ? `Removed from featured` : `Marked as featured signature project`
      );
      fetchProjects();
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
            <FolderGit2 className="w-7 h-7 text-[#D7B65A]" />
            Signature Projects
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Showcase long-term initiatives, community impact, and flagship campaigns
          </p>
        </div>

        <Link
          to="/admin/projects/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0c192e]/60 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by project title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
          />
        </form>

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

      {/* Projects Table */}
      <div className="glass-panel rounded-2xl border border-white/10 bg-[#0c192e]/40 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No projects found"
            description={
              search || statusFilter !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'Highlight your club impact by adding signature projects.'
            }
            actionLabel="Add Project"
            onAction={() => navigate('/admin/projects/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#07111F]/70 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Project</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Year / Date</th>
                  <th className="py-3.5 px-4 font-semibold">Impact</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Featured</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {project.cover_image_url ? (
                          <img
                            src={project.cover_image_url}
                            alt={project.title}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 flex-shrink-0">
                            <FolderGit2 className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/admin/projects/${project.id}/edit`}
                            className="font-semibold text-white group-hover:text-[#D7B65A] transition-colors line-clamp-1"
                          >
                            {project.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-500">
                              /{project.slug}
                            </span>
                            {project.collaborators && project.collaborators.length > 0 && (
                              <span className="text-[11px] text-slate-400">
                                • {project.collaborators.length} partner{project.collaborators.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs bg-[#D7B65A]/10 text-[#D7B65A] border border-[#D7B65A]/20 px-2.5 py-1 rounded-full font-medium">
                        {project.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                      <div className="font-semibold text-white">{project.year || '—'}</div>
                      <div className="text-[11px] text-slate-400">{project.project_date || ''}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {project.impact_metrics && project.impact_metrics.length > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#D7B65A]">
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>{project.impact_metrics.length} metric{project.impact_metrics.length > 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">None</span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={project.status} />
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          project.featured
                            ? 'text-[#D7B65A] hover:bg-[#D7B65A]/10'
                            : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${project.featured ? 'fill-[#D7B65A]' : ''}`} />
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(project)}
                          title={project.status === 'published' ? 'Unpublish' : 'Publish'}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          {project.status === 'published' ? (
                            <EyeOff className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>

                        {project.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(project)}
                            title="Archive"
                            className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        <Link
                          to={`/admin/projects/${project.id}/edit`}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-[#D7B65A] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeleteId(project.id)}
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

        {!loading && projects.length > 0 && (
          <div className="py-3.5 px-4 bg-[#07111F]/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-white">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-semibold text-white">{totalCount}</span> projects
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

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Project"
        message="Are you sure you want to permanently delete this project? This action cannot be undone."
        confirmLabel="Delete Project"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
