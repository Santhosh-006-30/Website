import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { PROJECTS } from '../data/projects';
import type { Project as PublicProject } from '../types';
import { getPublishedProjects } from '../services/projects';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';
import { SEO } from './SEO';
import { SITE_CONFIG, getCanonicalUrl } from '../config/site';

function mapDbProjectToPublicProject(dbProj: any): PublicProject {
  return {
    id: dbProj.id,
    title: dbProj.title,
    slug: dbProj.slug,
    category: dbProj.category || 'Community Service',
    date: dbProj.project_date || `${dbProj.year || new Date().getFullYear()}`,
    year: dbProj.year || new Date().getFullYear(),
    description: dbProj.description || '',
    shortDescription: dbProj.short_description || dbProj.description || '',
    image: dbProj.cover_image_url || '',
    featured: Boolean(dbProj.featured),
    impactMetrics: dbProj.impact_metrics || undefined,
    collaborators: dbProj.collaborators || undefined,
    source: dbProj.source_platform
      ? {
          platform: dbProj.source_platform as any,
          url: dbProj.source_url || undefined,
          verified: Boolean(dbProj.source_verified),
        }
      : undefined,
  };
}

export const ProjectsPage: React.FC = () => {
  const [projectsList, setProjectsList] = useState<PublicProject[]>(PROJECTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    let isMounted = true;
    getPublishedProjects()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setProjectsList(data.map(mapDbProjectToPublicProject));
        }
      })
      .catch((err) => {
        console.warn('Could not load projects from database, using verified fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Projects & Initiatives | Rotaract Club of Lead India Ahead',
    description:
      'Verified flagship community, sports, and health initiatives conducted by the Rotaract Club of Lead India Ahead across District 3206.',
    url: getCanonicalUrl('/projects'),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.siteUrl,
    },
  };

  const filteredProjects = useMemo(() => {
    return projectsList.filter((proj) => {
      const matchesSearch =
        !search.trim() ||
        proj.title.toLowerCase().includes(search.toLowerCase()) ||
        proj.description.toLowerCase().includes(search.toLowerCase()) ||
        proj.category.toLowerCase().includes(search.toLowerCase()) ||
        (proj.collaborators &&
          proj.collaborators.some((c) => c.toLowerCase().includes(search.toLowerCase()))) ||
        (proj.impactMetrics &&
          proj.impactMetrics.some(
            (m) =>
              m.label.toLowerCase().includes(search.toLowerCase()) ||
              m.value.toLowerCase().includes(search.toLowerCase())
          ));

      const matchesCategory =
        selectedCategory === 'ALL' ||
        proj.category.toUpperCase().includes(selectedCategory);

      const matchesYear =
        selectedYear === 'ALL' ||
        String(proj.year) === selectedYear;

      return matchesSearch && matchesCategory && matchesYear;
    });
  }, [projectsList, search, selectedCategory, selectedYear]);

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Community Service', value: 'COMMUNITY' },
    { label: 'Health & Wellness', value: 'HEALTH' },
    { label: 'Sports Development', value: 'SPORTS' },
  ];

  const years = [
    { label: 'All Years', value: 'ALL' },
    { label: '2026', value: '2026' },
    { label: '2025', value: '2025' },
  ];

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#D7B65A]/30 selection:text-[#E8D89A] flex flex-col">
      <SEO
        title="Signature Projects — Rotaract Club of Lead India Ahead"
        description="Discover verified signature projects and sustained community initiatives of the Rotaract Club of Lead India Ahead, empowering youth and communities across Coimbatore."
        canonicalPath="/projects"
        jsonLd={collectionJsonLd}
      />

      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider">
              <span>Verified Impact Records</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              PROJECTS &amp; <span className="gold-gradient-text">INITIATIVES</span>
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
              Explore authentic initiatives in youth sports, public health education, mental wellness advocacy, and grassroots development led by Rotaract LIA.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 bg-[#0c192e]/40 space-y-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects by title, category, impact metrics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#D7B65A]/50 transition-colors"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0c192e] border border-white/10 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#D7B65A]/50 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value} className="bg-[#07111F] text-slate-200">
                      {c.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0c192e] border border-white/10 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-[#D7B65A]/50 cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y.value} value={y.value} className="bg-[#07111F] text-slate-200">
                      {y.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>
                Showing {filteredProjects.length}{' '}
                {filteredProjects.length === 1 ? 'project' : 'projects'}
              </span>
              {(search || selectedCategory !== 'ALL' || selectedYear !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('ALL');
                    setSelectedYear('ALL');
                  }}
                  className="text-[#D7B65A] hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/30 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-[#D7B65A]">
                <FolderKanban className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">No projects match your criteria</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Try adjusting your search terms or clearing selected category and year filters.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('ALL');
                  setSelectedYear('ALL');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D7B65A] border border-[#D7B65A]/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              <AnimatePresence>
                {filteredProjects.map((proj) => (
                  <motion.div
                    layout
                    key={proj.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-white/10 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-56 sm:h-64 overflow-hidden">
                        <img
                          src={proj.image || '/assets/events/the-one.jpg'}
                          alt={proj.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-[#0B1728]/30 to-transparent" />

                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#07111F]/80 text-[#D7B65A] border border-[#D7B65A]/40 backdrop-blur-md">
                            {proj.category}
                          </span>
                          {proj.source?.verified && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-300 font-medium">
                          <span>{proj.date}</span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 sm:p-8 space-y-4">
                        <h3 className="font-heading font-bold text-xl sm:text-2xl text-white group-hover:text-[#E8D89A] transition-colors leading-snug">
                          {proj.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed line-clamp-3">
                          {proj.shortDescription || proj.description}
                        </p>

                        {/* Impact Metric Pills */}
                        {proj.impactMetrics && proj.impactMetrics.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                            {proj.impactMetrics.map((metric, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center"
                              >
                                <span className="block text-sm sm:text-base font-bold text-[#D7B65A]">
                                  {metric.value}
                                </span>
                                <span className="block text-[10px] text-slate-400 truncate">
                                  {metric.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>Sustained Community Impact</span>
                      </div>

                      <Link
                        to={`/projects/${proj.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-md shadow-[#D7B65A]/20 transition-all cursor-pointer"
                      >
                        <span>Project Record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
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
