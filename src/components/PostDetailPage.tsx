import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Check,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { getPublishedPostBySlug, getPublishedPosts } from '../services/posts';
import type { Post } from '../types/supabase';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';
import { SEO } from './SEO';
import { sanitizeHtml, calculateReadingTime } from '../lib/sanitizeHtml';
import { getCanonicalUrl } from '../config/site';

export const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
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
        const found = await getPublishedPostBySlug(slug!);
        if (isMounted) {
          setPost(found);
          if (found) {
            const all = await getPublishedPosts();
            if (isMounted) {
              const related = all
                .filter((p) => p.id !== found.id && (p.category === found.category || p.featured))
                .slice(0, 3);
              setRelatedPosts(related);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load post detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const readingTime = post ? calculateReadingTime(post.content || '') : 1;

  // BlogPosting Schema.org JSON-LD
  const blogPostingJsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || post.title,
        image: post.cover_image_url || undefined,
        datePublished: post.publish_date || post.created_at,
        dateModified: post.updated_at || post.created_at,
        author: {
          '@type': 'Organization',
          name: post.author || 'Rotaract Club of Lead India Ahead',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Rotaract Club of Lead India Ahead',
          logo: {
            '@type': 'ImageObject',
            url: 'https://lia-website-six.vercel.app/assets/logos/lia-shield.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': getCanonicalUrl(`/posts/${post.slug}`),
        },
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col selection:bg-[#D7B65A]/30 selection:text-[#E8D89A]">
      <SEO
        title={post ? post.title : 'Article Details'}
        description={
          post?.excerpt ||
          'Read official stories, announcements, and updates from Rotaract Club of Lead India Ahead.'
        }
        canonicalPath={post ? `/posts/${post.slug}` : undefined}
        ogImage={post?.cover_image_url || undefined}
        ogType="article"
        jsonLd={blogPostingJsonLd}
      />

      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-400">
              <Link to="/" className="hover:text-[#D7B65A] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <Link to="/posts" className="hover:text-[#D7B65A] transition-colors">
                Stories
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[#D7B65A] font-medium truncate max-w-[180px] sm:max-w-xs">
                {post ? post.title : 'Article'}
              </span>
            </nav>

            <Link
              to="/posts"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#D7B65A] font-medium transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Stories
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-6 animate-pulse py-12">
              <div className="h-64 sm:h-96 bg-white/5 rounded-3xl" />
              <div className="h-10 bg-white/5 rounded-xl w-3/4" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
              <div className="space-y-3 pt-6">
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-4 bg-white/5 rounded w-5/6" />
              </div>
            </div>
          )}

          {/* Not Found State */}
          {!loading && !post && (
            <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 bg-[#0c192e]/40 my-12">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Article Not Found</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                The requested story is either unavailable, has been moved, or remains in draft review.
              </p>
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#07111F] bg-[#D7B65A] hover:bg-[#E8D89A] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Stories
              </Link>
            </div>
          )}

          {/* Article Content */}
          {!loading && post && (
            <article className="space-y-8">
              {/* Category & Metadata Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#D7B65A]/15 text-[#D7B65A] border border-[#D7B65A]/30">
                    {post.category}
                  </span>
                  {post.featured && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      ⭐ Featured Story
                    </span>
                  )}
                </div>

                <h1 className="font-heading font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                  {post.title}
                </h1>

                {/* Author & Date Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-white/10 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#D7B65A]" />
                      <span className="text-slate-200 font-medium">{post.author || 'Rotaract LIA'}</span>
                    </div>
                    {post.publish_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#D7B65A]" />
                        <span>{post.publish_date}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{readingTime} min read</span>
                    </div>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                    aria-label="Share article"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#D7B65A]" />
                        <span>Share Article</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cover Image */}
              {post.cover_image_url && (
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a1526] shadow-2xl max-h-[500px]">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover max-h-[500px]"
                  />
                </div>
              )}

              {/* Excerpt Callout */}
              {post.excerpt && (
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border-l-4 border-[#D7B65A] text-slate-300 text-sm sm:text-base leading-relaxed italic">
                  {post.excerpt}
                </div>
              )}

              {/* Sanitized HTML Body */}
              <div
                className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 pt-4"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(post.content || ''),
                }}
              />

              {/* Social Links if present */}
              {(post.instagram_url || post.linkedin_url) && (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4 mt-8">
                  <span className="text-xs text-slate-400 font-medium">Follow this story on social media:</span>
                  <div className="flex items-center gap-3">
                    {post.instagram_url && (
                      <a
                        href={post.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 bg-pink-500/10 border border-pink-500/20 px-3.5 py-1.5 rounded-full transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Instagram
                      </a>
                    )}
                    {post.linkedin_url && (
                      <a
                        href={post.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Related Posts Section */}
              {relatedPosts.length > 0 && (
                <div className="pt-12 border-t border-white/10 space-y-6">
                  <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
                    Related Stories & Updates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedPosts.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/posts/${rel.slug}`}
                        className="group p-4 rounded-xl glass-card border border-white/10 hover:border-[#D7B65A]/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#D7B65A] mb-1.5 block">
                            {rel.category}
                          </span>
                          <h4 className="font-heading font-bold text-white text-xs sm:text-sm line-clamp-2 group-hover:text-[#E8D89A] transition-colors">
                            {rel.title}
                          </h4>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{rel.publish_date || 'Recent'}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#D7B65A] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>
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
