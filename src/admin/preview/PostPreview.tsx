import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Calendar, User, Eye, AlertTriangle, ExternalLink 
} from 'lucide-react';
import { adminGetPost } from '../../services/posts';
import type { Post } from '../../types/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const PostPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminGetPost(id);
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load post');
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
        <p className="text-slate-400 text-sm mt-3">Loading post preview...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-100">Post Not Found</h2>
        <p className="text-slate-400 text-sm mt-1">{error || 'The requested post could not be found.'}</p>
        <Link
          to="/admin/posts"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Posts
        </Link>
      </div>
    );
  }

  const isDraft = post.status === 'draft';
  const isArchived = post.status === 'archived';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md sticky top-4 z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/posts')}
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
            post.status === 'published'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : post.status === 'draft'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
          }`}>
            {post.status.toUpperCase()}
          </span>

          <Link
            to={`/admin/posts/${post.id}/edit`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Post
          </Link>
        </div>
      </div>

      {/* Draft Warning */}
      {(isDraft || isArchived) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block mb-0.5">
              PREVIEW MODE — THIS POST IS {post.status.toUpperCase()}
            </span>
            This article is only accessible to logged-in administrators and will not appear to the public.
          </div>
        </div>
      )}

      {/* Preview Card */}
      <article className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        {post.cover_image_url && (
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold rounded-full uppercase tracking-wider">
              {post.category}
            </span>
            {post.featured && (
              <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-full">
                ⭐ Featured Article
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 py-3 border-y border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-200 font-medium">{post.author}</span>
            </div>
            {post.publish_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{new Date(post.publish_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {post.excerpt && (
            <p className="text-base text-slate-300 font-medium italic border-l-2 border-cyan-500 pl-4">
              {post.excerpt}
            </p>
          )}

          <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-line pt-2">
            {post.content || 'No content written yet.'}
          </div>

          {(post.instagram_url || post.linkedin_url) && (
            <div className="flex items-center gap-4 pt-4 border-t border-slate-800 text-xs">
              {post.instagram_url && (
                <a
                  href={post.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-pink-400 hover:text-pink-300 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Instagram
                </a>
              )}
              {post.linkedin_url && (
                <a
                  href={post.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
};
