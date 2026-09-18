import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, Eye, EyeOff, 
  Archive, Star, FileText, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { 
  adminGetPosts, 
  adminDeletePost, 
  adminPublishPost, 
  adminUnpublishPost,
  adminArchivePost,
  adminUpdatePost 
} from '../../services/posts';
import type { Post, ContentStatus } from '../../types/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../shared/StatusBadge';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { TableSkeleton } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { showToast } from '../shared/Toast';

export const PostManager: React.FC = () => {
  const navigate = useNavigate();
  const { canDelete, canWrite } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingStatusPost, setPendingStatusPost] = useState<{
    post: Post;
    targetStatus: 'published' | 'draft' | 'archived';
  } | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetPosts({
        page: currentPage,
        pageSize,
        status: statusFilter,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search.trim() || undefined,
      });
      setPosts(res.data);
      setTotalCount(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEventsOrPosts();
  };

  const fetchEventsOrPosts = () => {
    fetchPosts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDeletePost(deleteId);
      showToast.success('Post deleted successfully');
      setDeleteId(null);
      fetchPosts();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const executeStatusChange = async () => {
    if (!pendingStatusPost) return;
    const { post, targetStatus } = pendingStatusPost;
    try {
      if (targetStatus === 'published') {
        await adminPublishPost(post.id);
        showToast.success(`"${post.title}" published`);
      } else if (targetStatus === 'archived') {
        await adminArchivePost(post.id);
        showToast.success(`"${post.title}" archived`);
      } else {
        await adminUnpublishPost(post.id);
        showToast.success(`"${post.title}" unpublished`);
      }
      fetchPosts();
    } catch (err: any) {
      showToast.error(err.message || 'Failed to update status');
    } finally {
      setPendingStatusPost(null);
    }
  };

  const handleToggleStatus = (post: Post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    setPendingStatusPost({ post, targetStatus: nextStatus });
  };

  const handleArchive = (post: Post) => {
    setPendingStatusPost({ post, targetStatus: 'archived' });
  };

  const handleToggleFeatured = async (post: Post) => {
    try {
      await adminUpdatePost(post.id, { featured: !post.featured });
      showToast.success(
        post.featured ? `Removed from featured` : `Marked as featured`
      );
      fetchPosts();
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
            <FileText className="w-7 h-7 text-[#D7B65A]" />
            Posts & Articles
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Publish club news, project updates, stories, and press releases
          </p>
        </div>

        <Link
          to="/admin/posts/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Write New Post
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0c192e]/60 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by post title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#D7B65A]/60 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Club News">Club News</option>
            <option value="Events">Events</option>
            <option value="Community">Community</option>
            <option value="Achievements">Achievements</option>
            <option value="Announcements">Announcements</option>
          </select>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
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
      </div>

      {/* Posts Table */}
      <div className="glass-panel rounded-2xl border border-white/10 bg-[#0c192e]/40 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No posts found"
            description={
              search || statusFilter !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'Share your club achievements and stories by writing your first post.'
            }
            actionLabel="Write Post"
            onAction={() => navigate('/admin/posts/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#07111F]/70 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Post</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Featured</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {post.cover_image_url ? (
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/admin/posts/${post.id}/edit`}
                            className="font-semibold text-white group-hover:text-[#D7B65A] transition-colors line-clamp-1"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-500">
                              /{post.slug}
                            </span>
                            {post.author && (
                              <span className="text-[11px] text-slate-400">
                                • {post.author}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs bg-white/5 text-slate-300 border border-white/10 px-2.5 py-1 rounded-full font-medium">
                        {post.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                      {post.publish_date || 'Not set'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={post.status} />
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        title={post.featured ? 'Remove from featured' : 'Mark as featured'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          post.featured
                            ? 'text-[#D7B65A] hover:bg-[#D7B65A]/10'
                            : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${post.featured ? 'fill-[#D7B65A]' : ''}`} />
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Preview Button */}
                        <Link
                          to={`/admin/preview/post/${post.id}`}
                          title="Preview Post"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-cyan-400" />
                        </Link>

                        {/* Status Toggle Button */}
                        {canWrite && (
                          <button
                            onClick={() => handleToggleStatus(post)}
                            title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          >
                            {post.status === 'published' ? (
                              <EyeOff className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                        )}

                        {/* Archive Button */}
                        {canWrite && post.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(post)}
                            title="Archive"
                            className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <Link
                          to={`/admin/posts/${post.id}/edit`}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-[#D7B65A] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Delete Button (admin/super_admin only) */}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteId(post.id)}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="py-3.5 px-4 bg-[#07111F]/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-white">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-semibold text-white">{totalCount}</span> posts
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

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(pendingStatusPost)}
        title={
          pendingStatusPost?.targetStatus === 'published'
            ? 'Publish Post to Live Website'
            : pendingStatusPost?.targetStatus === 'archived'
            ? 'Archive Post'
            : 'Unpublish Post (Move to Draft)'
        }
        message={
          pendingStatusPost?.targetStatus === 'published'
            ? `Are you sure you want to publish "${pendingStatusPost?.post.title}"? It will be immediately visible on the public website.`
            : pendingStatusPost?.targetStatus === 'archived'
            ? `Are you sure you want to archive "${pendingStatusPost?.post.title}"?`
            : `Are you sure you want to unpublish "${pendingStatusPost?.post.title}"?`
        }
        confirmLabel={
          pendingStatusPost?.targetStatus === 'published'
            ? 'Publish Now'
            : pendingStatusPost?.targetStatus === 'archived'
            ? 'Archive Post'
            : 'Unpublish Post'
        }
        confirmVariant={pendingStatusPost?.targetStatus === 'published' ? 'primary' : 'warning'}
        onConfirm={executeStatusChange}
        onCancel={() => setPendingStatusPost(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmLabel="Delete Post"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
