import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  ExternalLink,
  ArrowRight,
  Filter,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { getPublishedCareers } from '../services/careers';
import type { Career } from '../types/supabase';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';

export const CareersPage: React.FC = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Careers & Opportunities | Rotaract Club of Lead India Ahead';
    window.scrollTo({ top: 0, behavior: 'instant' });

    // SEO meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      (metaDesc as HTMLMetaElement).name = 'description';
      document.head.appendChild(metaDesc);
    }
    (metaDesc as HTMLMetaElement).content =
      'Explore verified job, internship, fellowship, and volunteer opportunities curated by the Rotaract Club of Lead India Ahead for ambitious young professionals across District 3206.';

    async function load() {
      try {
        const data = await getPublishedCareers();
        setCareers(data);
      } catch (err) {
        console.error('Failed to load published careers:', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const filteredCareers = useMemo(() => {
    return careers.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.organization_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(search.toLowerCase())) ||
        (item.preferred_skills && item.preferred_skills.toLowerCase().includes(search.toLowerCase())) ||
        (item.requirements && item.requirements.toLowerCase().includes(search.toLowerCase()));

      const matchesType = selectedType === 'all' || item.opportunity_type === selectedType;
      const matchesMode = selectedMode === 'all' || item.work_mode === selectedMode;

      return matchesSearch && matchesType && matchesMode;
    });
  }, [careers, search, selectedType, selectedMode]);

  const typeOptions = [
    { label: 'All Opportunities', value: 'all' },
    { label: 'Full-time & Jobs', value: 'job' },
    { label: 'Internships', value: 'internship' },
    { label: 'Fellowships', value: 'fellowship' },
    { label: 'Project Roles', value: 'project_role' },
    { label: 'Volunteer', value: 'volunteer' },
  ];

  const modeOptions = [
    { label: 'All Modes', value: 'all' },
    { label: 'Remote', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'On-Site', value: 'on_site' },
  ];

  const formatDeadline = (deadlineStr: string | null) => {
    if (!deadlineStr) return 'Rolling Applications';
    const d = new Date(deadlineStr);
    return `Deadline: ${d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#D7B65A]/30 selection:text-[#E8D89A] flex flex-col">
      {/* Brand Navigation */}
      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Breadcrumb & Home Link */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 hover:text-[#D7B65A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
            <span>/</span>
            <span className="text-[#D7B65A] font-medium">Careers & Opportunities</span>
          </div>

          {/* Page Hero Header */}
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-white/10 bg-gradient-to-br from-[#10233D]/90 via-[#07111F] to-[#0d1c32]/80 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-[#D7B65A]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7B65A]/10 border border-[#D7B65A]/30 text-[#E8D89A] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#D7B65A]" />
                Youth Empowerment & Professional Growth
              </div>

              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                Careers &amp; Opportunities
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Connect with genuine, high-impact roles from verified organizations, corporate
                partners, startup incubators, and fellowship initiatives. Curated for Rotaractors
                and ambitious young professionals across District 3206 and beyond.
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by role, organization, skills, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 transition-colors"
                />
              </div>

              {/* Work Mode Selector */}
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium whitespace-nowrap">
                  <Filter className="w-3.5 h-3.5 text-[#D7B65A]" /> Mode:
                </span>
                {modeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedMode(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      selectedMode === opt.value
                        ? 'bg-[#D7B65A] text-[#07111F] font-semibold shadow-sm'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opportunity Type Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              {typeOptions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                    selectedType === t.value
                      ? 'bg-[#D7B65A]/20 text-[#E8D89A] border border-[#D7B65A]/40 font-semibold'
                      : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredCareers.length}</strong> available{' '}
              {filteredCareers.length === 1 ? 'opportunity' : 'opportunities'}
            </span>
            {(search || selectedType !== 'all' || selectedMode !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedType('all');
                  setSelectedMode('all');
                }}
                className="text-[#D7B65A] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Loading & Grid Display */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-[#0c192e]/40 border border-white/5 animate-pulse h-64"
                />
              ))}
            </div>
          ) : filteredCareers.length === 0 ? (
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/30 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-[#D7B65A]">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">No opportunities found</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {search || selectedType !== 'all' || selectedMode !== 'all'
                  ? 'Try broadening your search terms or resetting the selected filters.'
                  : 'New job openings and internships are published frequently. Please check back soon or join our community.'}
              </p>
              {(search || selectedType !== 'all' || selectedMode !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedType('all');
                    setSelectedMode('all');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D7B65A] border border-[#D7B65A]/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredCareers.map((career) => (
                  <motion.div
                    key={career.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group flex flex-col justify-between rounded-2xl p-6 border border-white/10 bg-gradient-to-b from-[#0c192e]/90 to-[#07111F]/90 hover:border-[#D7B65A]/40 transition-all duration-300 shadow-xl hover:shadow-[#D7B65A]/10 hover:-translate-y-1"
                  >
                    <div className="space-y-4">
                      {/* Card Header: Organization Logo + Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {career.organization_logo_url ? (
                            <img
                              src={career.organization_logo_url}
                              alt={career.organization_name}
                              className="w-12 h-12 rounded-xl object-contain bg-white/5 p-1 border border-white/10 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D7B65A] flex-shrink-0">
                              <Building2 className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-400 truncate">
                              {career.organization_name}
                            </p>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {career.location || (career.work_mode === 'remote' ? 'Remote' : 'On-Site')}
                            </span>
                          </div>
                        </div>

                        {career.featured && (
                          <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      {/* Title & Type */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[11px] bg-[#D7B65A]/15 text-[#E8D89A] border border-[#D7B65A]/30 px-2.5 py-0.5 rounded-full font-semibold capitalize">
                            {career.opportunity_type.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] bg-white/5 text-slate-300 border border-white/10 px-2.5 py-0.5 rounded-full font-medium capitalize">
                            {career.work_mode.replace('_', '-')}
                          </span>
                        </div>

                        <Link
                          to={`/careers/${career.slug}`}
                          className="font-heading font-bold text-lg text-white group-hover:text-[#E8D89A] transition-colors line-clamp-2 leading-snug"
                        >
                          {career.title}
                        </Link>
                      </div>

                      {/* Remuneration & Deadline */}
                      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        {career.remuneration ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {career.remuneration}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Competitive</span>
                        )}

                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatDeadline(career.application_deadline)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                      <Link
                        to={`/careers/${career.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                      >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      <a
                        href={career.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-md shadow-[#D7B65A]/20 transition-all cursor-pointer"
                      >
                        {career.application_label || 'Apply'}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Global Join Modal */}
      <JoinUs
        isModalOpen={isJoinModalOpen}
        onCloseModal={() => setIsJoinModalOpen(false)}
        onOpenModal={() => setIsJoinModalOpen(true)}
      />

      {/* Footer */}
      <Footer onOpenJoinModal={() => setIsJoinModalOpen(true)} />
    </div>
  );
};
