import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Layers,
  Users,
  Heart,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { MILESTONES } from '../data/journey';
import { PROJECTS } from '../data/projects';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';
import { SEO } from './SEO';
import { getCanonicalUrl } from '../config/site';

export const ImpactPage: React.FC = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const stats = [
    {
      id: 'years',
      number: '13+',
      label: 'Years of Leadership',
      detail: 'Chartered in 2012 under Rotary Club of Coimbatore Texcity (Club ID: 90062).',
      icon: Calendar,
      color: 'from-[#D7B65A] to-[#E8D89A]',
    },
    {
      id: 'projects',
      number: '50+',
      label: 'Community Projects',
      detail: 'Grassroots health clinics, athletic workshops, literacy campaigns & environmental drives.',
      icon: Layers,
      color: 'from-[#06B6D4] to-[#38BDF8]',
    },
    {
      id: 'volunteers',
      number: '100+',
      label: 'Active Volunteers',
      detail: 'Passionate student and young professional Rotaractors across Coimbatore colleges.',
      icon: Users,
      color: 'from-[#10B981] to-[#34D399]',
    },
    {
      id: 'impact',
      number: '5,000+',
      label: 'Lives Touched',
      detail: 'Direct community beneficiaries across sports clinics, medical awareness, and educational forums.',
      icon: Heart,
      color: 'from-[#F43F5E] to-[#FB7185]',
    },
  ];

  // Distinct categories from authentic milestones
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(
        MILESTONES.map((m) => m.category).filter((c): c is string => Boolean(c))
      )
    );
    return ['ALL', ...cats];
  }, []);

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    return MILESTONES.filter((m) => {
      const matchesCategory =
        selectedCategory === 'ALL' || m.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.year.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Signature projects with verified impact metrics
  const impactProjects = useMemo(() => {
    return PROJECTS.filter((p) => p.impactMetrics && p.impactMetrics.length > 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col font-body antialiased selection:bg-[#D7B65A]/30 selection:text-[#E8D89A]">
      <SEO
        title="Impact & Milestones | Rotaract Club of Lead India Ahead"
        description="Explore verified community impact, signature initiatives, and historical milestones of the Rotaract Club of Lead India Ahead (District 3206, Coimbatore)."
        canonicalUrl={getCanonicalUrl('/impact')}
      />

      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main id="main-content" className="flex-1 pt-24 sm:pt-28 pb-16">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#10233D]/70 blur-[130px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-6"
            >
              <Award className="w-3.5 h-3.5 text-[#D7B65A]" />
              <span>Rotaract District 3206 • Club ID 90062</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto"
            >
              MEASURING OUR <span className="gold-gradient-text">COMMUNITY IMPACT</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              Over 13 years of documented service, grassroots health drives, youth sports championships,
              and purposeful leadership in Coimbatore. Every metric represents real lives touched.
            </motion.p>
          </div>
        </section>

        {/* Core Stats Overview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 flex flex-col justify-between relative group hover:border-[#D7B65A]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-[#D7B65A] transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                        Verified Record
                      </span>
                    </div>

                    <div className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight text-white mb-2">
                      <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.number}
                      </span>
                    </div>

                    <div className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                      {stat.label}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-normal leading-relaxed border-t border-white/5 pt-3 mt-2">
                    {stat.detail}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Signature Initiatives Impact Breakdown */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#06B6D4] uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Grassroots Initiatives</span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-4xl text-white tracking-tight">
                Signature Project <span className="gold-gradient-text">Impact Breakdown</span>
              </h2>
            </div>
            <Link
              to="/projects"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs font-semibold text-[#D7B65A] hover:text-[#E8D89A] transition-colors group"
            >
              <span>View All Verified Projects</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {impactProjects.map((proj) => (
              <div
                key={proj.id}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all"
              >
                {proj.image && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={proj.image}
                      alt={proj.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#07111F]/80 backdrop-blur-md border border-white/15 text-[#D7B65A]">
                        {proj.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-white mb-2">
                      {proj.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                      {proj.shortDescription || proj.description}
                    </p>
                  </div>

                  {/* Impact Metric Pills */}
                  {proj.impactMetrics && proj.impactMetrics.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Documented Metrics:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {proj.impactMetrics.map((metric, idx) => (
                          <div
                            key={idx}
                            className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-center"
                          >
                            <div className="font-heading font-bold text-sm sm:text-base text-[#D7B65A]">
                              {metric.value}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium truncate">
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Verified Activity • {proj.year}</span>
                    </span>
                    <Link
                      to={`/projects/${proj.slug}`}
                      className="text-xs font-semibold text-[#D7B65A] hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historical Evolution & Milestones Archive */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-3">
                <Clock className="w-3.5 h-3.5 text-[#D7B65A]" />
                <span>Institutional Timeline</span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-4xl text-white tracking-tight">
                Historical Milestones &amp; <span className="gold-gradient-text">Recognitions</span>
              </h2>
            </div>
            <p className="max-w-md text-slate-400 text-xs sm:text-sm mt-3 md:mt-0">
              Chronicling significant institutional steps from our 2012 charter to the landmark 13th Installation Ceremony "THE ONE".
            </p>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#D7B65A] text-[#07111F] shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milestones..."
                className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/50 transition-colors"
              />
            </div>
          </div>

          {/* Milestones List */}
          {filteredMilestones.length > 0 ? (
            <div className="space-y-6">
              {filteredMilestones.map((m, idx) => (
                <motion.div
                  key={m.year + idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="glass-card rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-white/20 transition-all"
                >
                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#10233D] to-[#0B1728] border border-[#D7B65A]/40 flex flex-col items-center justify-center text-center p-2 shadow-inner">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#D7B65A]">
                        YEAR
                      </span>
                      <span className="font-heading font-extrabold text-sm sm:text-base text-white">
                        {m.year}
                      </span>
                    </div>

                    {m.image && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                        <img
                          src={m.image}
                          alt={m.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#D7B65A]/10 border border-[#D7B65A]/30 text-[#E8D89A]">
                        {m.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Institutional Milestone
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-white mb-2">
                      {m.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {m.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Polished Empty State */
            <div className="glass-card rounded-2xl border border-white/10 p-12 text-center max-w-lg mx-auto">
              <Filter className="w-10 h-10 text-slate-500 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                No Milestones Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                No documented club milestones match your current search or category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#D7B65A] text-[#07111F] hover:bg-[#E8D89A] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* ── Partners & Collaborations ─────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4] shrink-0 mt-1">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#06B6D4] mb-1">
                Verified Network
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                Partners &amp; <span className="text-[#D7B65A]">Collaborations</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Verified partner institutions and collaborative Rotaract/Rotary clubs that have actively co-organized events, co-hosted campaigns, and co-sponsored LIA's community initiatives during MAAYON 2026–27.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Rotary Club of Coimbatore Texcity',
                role: 'Sponsor & Charter Club',
                type: 'PRIMARY SPONSOR',
                typeColor: 'text-[#D7B65A] bg-[#D7B65A]/10 border-[#D7B65A]/30',
                description: "Our founding sponsor and charter Rotary club since 2012 (Club ID: 90062), providing institutional support across all major events and installations.",
              },
              {
                name: 'Rotaract District 3206',
                role: 'District Body',
                type: 'DISTRICT PARTNER',
                typeColor: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30',
                description: 'Our Rotaract district authority guiding governance, efficiency metrics, and fellowship across all clubs in the district.',
              },
              {
                name: 'Rotaract Club of SNS College of Technology',
                role: 'Co-organizer, DHEEMA',
                type: 'COLLABORATIVE CLUB',
                typeColor: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30',
                description: 'Collaborated on DHEEMA — World Hepatitis Day 2026 awareness campaign focused on viral hepatitis prevention and liver health.',
              },
              {
                name: 'Rotaract Club of Coimbatore Unity',
                role: 'Co-organizer, DHEEMA',
                type: 'COLLABORATIVE CLUB',
                typeColor: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30',
                description: 'Joint co-organizer for the World Hepatitis Day 2026 public health awareness initiative.',
              },
              {
                name: 'Rotaract Club of Coimbatore Gaalaxy',
                role: 'Co-organizer, MIND MATTERS',
                type: 'COLLABORATIVE CLUB',
                typeColor: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30',
                description: 'Partner club for the MIND MATTERS youth mental wellness forum held on International Youth Day 2025.',
              },
              {
                name: 'Rotaract Club of KAHE',
                role: 'Co-organizer, FUSION',
                type: 'COLLABORATIVE CLUB',
                typeColor: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30',
                description: 'Joint organizer for FUSION — a professional leadership masterclass on high-performance team coordination.',
              },
              {
                name: 'Coimbatore Eagles – New Life Sports Football Academy',
                role: 'Co-organizer, Kids Football Tournament',
                type: 'COMMUNITY PARTNER',
                typeColor: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
                description: 'Community sports partner for the 5-A-Side Kids Football Tournament 2026, supporting 120+ young athletes across 12 teams.',
              },
              {
                name: 'Rotaract Club of HICAS',
                role: 'MIND MATTERS & LAYOUT',
                type: 'COLLABORATIVE CLUB',
                typeColor: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30',
                description: 'Co-hosted the youth mental health forum (MIND MATTERS) and co-organized the LAYOUT editorial skills workshop.',
              },
              {
                name: 'Rotaract Club of Madras Cosmos',
                role: 'Co-organizer, MIND MATTERS',
                type: 'COLLABORATIVE CLUB',
                typeColor: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30',
                description: 'Participated in the cross-district youth mental health forum as part of the Mann Shakthi District Priority Project.',
              },
            ].map((partner) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-2xl border border-white/10 p-5 space-y-3 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${partner.typeColor}`}>
                    {partner.type}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white leading-snug mb-0.5">
                    {partner.name}
                  </h3>
                  <p className="text-[10px] font-semibold text-[#D7B65A] uppercase tracking-wider mb-2">
                    {partner.role}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Verification Guarantee */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 text-center">
          <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#D7B65A]/10 border border-[#D7B65A]/30 flex items-center justify-center shrink-0 text-[#D7B65A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm sm:text-base text-white mb-1">
                Authentic &amp; Verified Institutional Reporting
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All records, participant metrics, collaborative partner clubs, and timelines documented on this page are verified through official club reporting submitted to Rotaract District 3206 and Rotary Club of Coimbatore Texcity.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenJoinModal={() => setIsJoinModalOpen(true)} />
      <JoinUs
        isModalOpen={isJoinModalOpen}
        onCloseModal={() => setIsJoinModalOpen(false)}
        onOpenModal={() => setIsJoinModalOpen(true)}
      />
    </div>
  );
};
