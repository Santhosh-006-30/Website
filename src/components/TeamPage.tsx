import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  FileText,
  GraduationCap,
  Heart,
  X,
  Award,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { TEAM_MEMBERS } from '../data/team';
import type { TeamMember } from '../types';
import { getPublishedTeamMembers } from '../services/team';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';
import { SEO } from './SEO';
import { getCanonicalUrl } from '../config/site';

function mapSupabaseTeamMemberToPublic(dbMember: any): TeamMember {
  return {
    id: dbMember.id,
    name: dbMember.name,
    position: dbMember.designation,
    term: dbMember.term || '2026–27',
    image: dbMember.profile_image_url || undefined,
    letterImage: dbMember.letter_image_url || undefined,
    bio: dbMember.bio || undefined,
    collegeOrCompany: dbMember.college_company || undefined,
    bloodGroup: dbMember.blood_group || undefined,
    isExecutive: Boolean(dbMember.is_executive),
  };
}

export const TeamPage: React.FC = () => {
  const [membersList, setMembersList] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXECUTIVE' | 'ADVISORS' | 'GENERAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showLetterModal, setShowLetterModal] = useState<TeamMember | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    let isMounted = true;
    getPublishedTeamMembers()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setMembersList(data.map(mapSupabaseTeamMemberToPublic));
        }
      })
      .catch((err) => {
        console.warn('Could not load team members from database, using static fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Escape key handler for dialogs
  useEffect(() => {
    if (!selectedMember && !showLetterModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
        setShowLetterModal(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMember, showLetterModal]);

  const filteredMembers = useMemo(() => {
    return membersList.filter((m) => {
      // Role-based categorization
      const isAdvisor =
        m.position.toLowerCase().includes('past president') ||
        m.position.toLowerCase().includes('advisor');
      const isExec = m.isExecutive && !isAdvisor;
      const isGen = !m.isExecutive && !isAdvisor;

      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'EXECUTIVE' && isExec) ||
        (activeFilter === 'ADVISORS' && isAdvisor) ||
        (activeFilter === 'GENERAL' && isGen);

      const matchesSearch =
        searchQuery.trim() === '' ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.collegeOrCompany && m.collegeOrCompany.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [membersList, activeFilter, searchQuery]);

  const president = useMemo(() => {
    return membersList.find((m) => m.position.toLowerCase().includes('president') && !m.position.toLowerCase().includes('past'));
  }, [membersList]);

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col font-body antialiased selection:bg-[#D7B65A]/30 selection:text-[#E8D89A]">
      <SEO
        title="Leadership & Board of Directors | Rotaract Club of Lead India Ahead"
        description="Meet the dedicated leadership board of Rotaract Club of Lead India Ahead — Team MAAYON 2026–27. Chartered under Rotary Club of Coimbatore Texcity, District 3206."
        canonicalUrl={getCanonicalUrl('/team')}
      />

      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main id="main-content" className="flex-1 pt-24 sm:pt-28 pb-16">
        {/* Header Hero */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#10233D]/70 blur-[130px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-6"
            >
              <Users className="w-3.5 h-3.5 text-[#D7B65A]" />
              <span>Rotaract District 3206 • Team MAAYON 2026–27</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto"
            >
              BOARD OF <span className="gold-gradient-text">DIRECTORS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
            >
              Guided by the vision of MAAYON, our executive council and directors combine passion,
              professional discipline, and selfless community service to lead India ahead.
            </motion.p>
          </div>
        </section>

        {/* President Spotlight Feature */}
        {president && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-[#D7B65A]/30 relative overflow-hidden bg-gradient-to-br from-[#10233D]/60 via-[#07111F] to-[#07111F]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#D7B65A]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#D7B65A] to-[#E8D89A] flex items-center justify-center font-heading font-extrabold text-3xl sm:text-4xl text-[#07111F] shadow-xl shadow-black/40 shrink-0">
                  HB
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D7B65A]/10 border border-[#D7B65A]/30 text-xs font-semibold text-[#E8D89A] mb-3">
                    <Award className="w-3.5 h-3.5 text-[#D7B65A]" />
                    <span>Club President • Rotary Year 2026–27</span>
                  </div>

                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white mb-2">
                    {president.name}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mb-6">
                    {president.bio}
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 border-t border-white/10 pt-4">
                    {president.collegeOrCompany && (
                      <span className="flex items-center space-x-1.5">
                        <GraduationCap className="w-4 h-4 text-[#D7B65A]" />
                        <span>{president.collegeOrCompany}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      <span>District 3206 Certified Leader</span>
                    </span>
                    {president.bloodGroup && (
                      <span className="flex items-center space-x-1.5">
                        <Heart className="w-4 h-4 text-[#F43F5E]" />
                        <span>Blood Group: {president.bloodGroup}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Directory Controls */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === 'ALL'
                    ? 'bg-[#D7B65A] text-[#07111F] shadow'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                All Board ({membersList.length})
              </button>
              <button
                onClick={() => setActiveFilter('EXECUTIVE')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === 'EXECUTIVE'
                    ? 'bg-[#D7B65A] text-[#07111F] shadow'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                Executive Council
              </button>
              <button
                onClick={() => setActiveFilter('ADVISORS')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === 'ADVISORS'
                    ? 'bg-[#D7B65A] text-[#07111F] shadow'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                Past Leaders &amp; Advisors
              </button>
              <button
                onClick={() => setActiveFilter('GENERAL')}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === 'GENERAL'
                    ? 'bg-[#D7B65A] text-[#07111F] shadow'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                Board Directors
              </button>
            </div>

            {/* Search Input */}
            <div className="relative sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, institution..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Members Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map((member) => {
                const initials = member.name
                  .replace('Rtr. ', '')
                  .replace('IPP. ', '')
                  .replace('PP. ', '')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-[#D7B65A]/40 transition-all cursor-pointer group relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-heading font-bold text-white text-base group-hover:border-[#D7B65A]/40 transition-colors">
                          {initials}
                        </div>

                        {member.letterImage && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLetterModal(member);
                            }}
                            className="px-2.5 py-1 rounded-md text-[10px] font-semibold text-[#D7B65A] bg-[#D7B65A]/10 border border-[#D7B65A]/30 hover:bg-[#D7B65A] hover:text-[#07111F] transition-all flex items-center space-x-1"
                            title="View Official Appointment Letter"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Letter</span>
                          </button>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#E8D89A] transition-colors leading-snug">
                        {member.name}
                      </h3>

                      <div className="text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mt-1 mb-2">
                        {member.position}
                      </div>

                      {member.bio && (
                        <p className="text-xs text-slate-400 font-normal leading-relaxed line-clamp-3 mb-3">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    {member.collegeOrCompany && (
                      <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center space-x-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{member.collegeOrCompany}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="glass-card rounded-2xl border border-white/10 p-12 text-center max-w-lg mx-auto">
              <Users className="w-10 h-10 text-slate-500 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                No Members Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                No board members match your current filter or search criteria.
              </p>
              <button
                onClick={() => {
                  setActiveFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#D7B65A] text-[#07111F] hover:bg-[#E8D89A] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Member Profile Modal (Accessible Dialog) */}
      <AnimatePresence>
        {selectedMember && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-lg w-full glass-panel rounded-3xl overflow-hidden border border-white/20 shadow-2xl z-10 p-6 sm:p-8"
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#10233D] to-[#07111F] border border-[#D7B65A]/40 flex items-center justify-center font-heading font-bold text-2xl text-[#D7B65A] mx-auto mb-4 shadow-lg">
                  {selectedMember.name
                    .replace('Rtr. ', '')
                    .replace('IPP. ', '')
                    .replace('PP. ', '')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <h3 id="member-modal-title" className="font-heading font-bold text-xl text-white">
                  {selectedMember.name}
                </h3>
                <div className="text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mt-1">
                  {selectedMember.position} • {selectedMember.term}
                </div>
              </div>

              {selectedMember.bio && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 border-t border-b border-white/10 py-4">
                  {selectedMember.bio}
                </p>
              )}

              <div className="space-y-2.5 text-xs text-slate-300">
                {selectedMember.collegeOrCompany && (
                  <div className="flex items-center space-x-2.5">
                    <Building className="w-4 h-4 text-[#D7B65A] shrink-0" />
                    <span>{selectedMember.collegeOrCompany}</span>
                  </div>
                )}
                {selectedMember.bloodGroup && (
                  <div className="flex items-center space-x-2.5">
                    <Heart className="w-4 h-4 text-[#F43F5E] shrink-0" />
                    <span>Blood Group: {selectedMember.bloodGroup}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>District 3206 Certified Member</span>
                </div>
              </div>

              {selectedMember.letterImage && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      const m = selectedMember;
                      setSelectedMember(null);
                      setShowLetterModal(m);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#D7B65A]/10 border border-[#D7B65A]/30 text-xs font-semibold text-[#D7B65A] hover:bg-[#D7B65A] hover:text-[#07111F] transition-all flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Official Appointment Letter</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Letter Modal Preview */}
      <AnimatePresence>
        {showLetterModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-modal-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLetterModal(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-2xl w-full glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl z-10 p-3 sm:p-4 max-h-[92vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 px-2">
                <div className="min-w-0 pr-2">
                  <div id="letter-modal-title" className="text-xs sm:text-sm font-heading font-bold text-white truncate">
                    Official Appointment Letter — {showLetterModal.name}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#D7B65A] truncate">
                    {showLetterModal.position} • Rotary Year 2026–27
                  </div>
                </div>
                <button
                  onClick={() => setShowLetterModal(null)}
                  className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 text-white shrink-0"
                  aria-label="Close letter"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto mt-2 sm:mt-3 p-2 bg-[#07111F] rounded-xl flex items-center justify-center">
                {showLetterModal.letterImage && (
                  <img
                    src={showLetterModal.letterImage}
                    alt={`Appointment letter of ${showLetterModal.name}`}
                    loading="lazy"
                    className="max-h-[65vh] sm:max-h-[72vh] w-auto max-w-full object-contain rounded shadow-lg"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer onOpenJoinModal={() => setIsJoinModalOpen(true)} />
      <JoinUs
        isModalOpen={isJoinModalOpen}
        onCloseModal={() => setIsJoinModalOpen(false)}
        onOpenModal={() => setIsJoinModalOpen(true)}
      />
    </div>
  );
};
