import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Search, Edit2, Trash2, Eye, EyeOff, 
  ChevronLeft, ChevronRight, User 
} from 'lucide-react';
import { 
  adminGetTeamMembers, 
  adminDeleteTeamMember, 
  adminUpdateTeamMember 
} from '../../services/team';
import type { TeamMember } from '../../types/supabase';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TableSkeleton } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { showToast } from '../shared/Toast';

export const TeamManager: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [search, setSearch] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetTeamMembers({
        page: currentPage,
        pageSize,
        search: search.trim() || undefined,
      });
      setMembers(res.data);
      setTotalCount(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMembers();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDeleteTeamMember(deleteId);
      showToast.success('Team member removed');
      setDeleteId(null);
      fetchMembers();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to delete member');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublished = async (member: TeamMember) => {
    try {
      await adminUpdateTeamMember(member.id, { published: !member.published });
      showToast.success(
        member.published
          ? `Hidden "${member.name}" from public site`
          : `Published "${member.name}" to public site`
      );
      fetchMembers();
    } catch (err: any) {
      showToast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#D7B65A]" />
            Leadership & Team
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage board of directors, council members, and tenure appointments
          </p>
        </div>

        <Link
          to="/admin/team/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0c192e]/60 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
          />
        </form>
      </div>

      {/* Members Grid / Table */}
      <div className="glass-panel rounded-2xl border border-white/10 bg-[#0c192e]/40 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members found"
            description="Add club leaders, directors, and active members to show the team."
            actionLabel="Add Member"
            onAction={() => navigate('/admin/team/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#07111F]/70 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Member</th>
                  <th className="py-3.5 px-4 font-semibold">Designation</th>
                  <th className="py-3.5 px-4 font-semibold">Term</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {member.profile_image_url ? (
                          <img
                            src={member.profile_image_url}
                            alt={member.name}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 flex-shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/admin/team/${member.id}/edit`}
                            className="font-semibold text-white group-hover:text-[#D7B65A] transition-colors line-clamp-1"
                          >
                            {member.name}
                          </Link>
                          {member.college_company && (
                            <span className="text-[11px] text-slate-500 block truncate">
                              {member.college_company}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-[#D7B65A]">
                        {member.designation}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                      {member.term}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                          member.is_executive
                            ? 'bg-[#D7B65A]/10 text-[#D7B65A] border-[#D7B65A]/30'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        {member.is_executive ? 'Executive Board' : 'Team Member'}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                          member.published
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {member.published ? 'Published' : 'Hidden'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePublished(member)}
                          title={member.published ? 'Hide from public site' : 'Show on public site'}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          {member.published ? (
                            <EyeOff className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>

                        <Link
                          to={`/admin/team/${member.id}/edit`}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-[#D7B65A] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeleteId(member.id)}
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

        {!loading && members.length > 0 && (
          <div className="py-3.5 px-4 bg-[#07111F]/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-white">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-semibold text-white">{totalCount}</span> members
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
        title="Delete Team Member"
        message="Are you sure you want to remove this team member? This action cannot be undone."
        confirmLabel="Remove Member"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
