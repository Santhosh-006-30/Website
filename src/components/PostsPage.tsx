import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getPublishedPosts } from '../services/posts';
import type { Post } from '../types/supabase';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';
import { SEO } from './SEO';
import { calculateReadingTime } from '../lib/sanitizeHtml';

export const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getPublishedPosts();
        if (isMounted) {
          setPosts(data);
        }
      } catch (err) {
        console.error('Failed to load published posts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    'ALL',
    ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))),
  ];

  const filteredPosts = posts.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts.find((p) => p.featured) || (filteredPosts.length > 0 ? filteredPosts[0] : null);
  const regularPosts = featuredPost
    ? filteredPosts.filter((p) => p.id !== featuredPost.id)
    : filteredPosts;

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col selection:bg-[#D7B65A]/30 selection:text-[#E8D89A]">
      <SEO
        title="News & Stories"
        description="Latest news, official updates, and stories from the Rotaract Club of Lead India Ahead — MAAYON 2026–27."
        canonicalPath="/posts"
      />

      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-400 mb-8">
            <Link to="/" className="hover:text-[#D7B65A] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#D7B65A] font-medium">Stories & Updates</span>
          </nav>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-3">
                <FileText className="w-3.5 h-3.5 text-[#D7B65A]" />
                <span>Club Publications</span>
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight">
                STORIES & <span className="gold-gradient-text">UPDATES</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
                Official announcements, event reports, club achievements, and service highlights from Rotaract Club of Lead India Ahead.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search articles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 transition-colors"
              />
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#D7B65A] text-[#07111F] shadow-lg shadow-[#D7B65A]/20'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-white/5 rounded-2xl border border-white/5" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 bg-[#0c192e]/40 max-w-lg mx-auto my-12">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#D7B65A]">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Articles Found</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'No posts matched your current search criteria. Try clearing the filter.'
                  : 'New stories and updates are currently being prepared. Check back soon!'}
              </p>
              {(searchQuery || selectedCategory !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#07111F] bg-[#D7B65A] hover:bg-[#E8D89A] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Featured Post Banner */}
          {!loading && featuredPost && !searchQuery && selectedCategory === 'ALL' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <Link
                to={`/posts/${featuredPost.slug}`}
                className="group block relative rounded-3xl overflow-hidden glass-card border border-white/10 hover:border-[#D7B65A]/40 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 relative h-64 sm:h-96 lg:h-auto overflow-hidden bg-[#0a1526]">
                    {featuredPost.cover_image_url ? (
                      <img
                        src={featuredPost.cover_image_url}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[260px] flex items-center justify-center bg-gradient-to-br from-[#0c192e] to-[#07111F]">
                        <FileText className="w-16 h-16 text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-transparent to-transparent lg:hidden" />
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D7B65A]/15 text-[#D7B65A] border border-[#D7B65A]/30">
                          <Sparkles className="w-3 h-3" />
                          Featured
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                          {featuredPost.category}
                        </span>
                      </div>

                      <h2 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-white group-hover:text-[#E8D89A] transition-colors leading-tight mb-3">
                        {featuredPost.title}
                      </h2>

                      {featuredPost.excerpt && (
                        <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6 font-normal">
                          {featuredPost.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        {featuredPost.publish_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#D7B65A]" />
                            <span>{featuredPost.publish_date}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{calculateReadingTime(featuredPost.content || '')} min read</span>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#D7B65A] group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Regular Posts Grid */}
          {!loading && (
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, idx) => {
                  const readTime = calculateReadingTime(post.content || '');
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                    >
                      <Link
                        to={`/posts/${post.slug}`}
                        className="group flex flex-col h-full rounded-2xl overflow-hidden glass-card border border-white/10 hover:border-[#D7B65A]/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                      >
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0c192e]">
                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt={post.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0c192e] to-[#07111F]">
                              <FileText className="w-10 h-10 text-white/10" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#07111F]/80 text-[#D7B65A] border border-[#D7B65A]/30 backdrop-blur-md">
                              {post.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-grow justify-between">
                          <div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-2">
                              {post.publish_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#D7B65A]" />
                                  <span>{post.publish_date}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                <span>{readTime} min read</span>
                              </div>
                            </div>

                            <h3 className="font-heading font-bold text-white text-base leading-snug group-hover:text-[#E8D89A] transition-colors line-clamp-2 mb-2">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed font-normal">
                                {post.excerpt}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                              {post.author || 'Rotaract LIA'}
                            </span>
                            <span className="text-[#D7B65A] font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              Read Article <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
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
