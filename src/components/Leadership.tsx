import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, X, GraduationCap, ShieldCheck, Heart } from "lucide-react";
import { TEAM_MEMBERS } from "../data/team";
import type { TeamMember } from "../types";
import { getPublishedTeamMembers } from "../services/team";

function mapSupabaseTeamMemberToPublic(dbMember: any): TeamMember {
  return {
    id: dbMember.id,
    name: dbMember.name,
    position: dbMember.designation,
    term: dbMember.term || "2026–27",
    image: dbMember.profile_image_url || undefined,
    letterImage: dbMember.letter_image_url || undefined,
    bio: dbMember.bio || undefined,
    collegeOrCompany: dbMember.college_company || undefined,
    bloodGroup: dbMember.blood_group || undefined,
    isExecutive: Boolean(dbMember.is_executive),
  };
}

export const Leadership = () => {
  const [membersList, setMembersList] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [activeTab, setActiveTab] = useState<"EXECUTIVE" | "ALL">("EXECUTIVE");
  const [selectedLetter, setSelectedLetter] = useState<TeamMember | null>(null);

  useEffect(() => {
    let isMounted = true;
    getPublishedTeamMembers()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setMembersList(data.map(mapSupabaseTeamMemberToPublic));
        }
      })
      .catch((err) => {
        console.warn("Could not load team members from database, using static fallback:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle escape key for letter preview modal
  useEffect(() => {
    if (!selectedLetter) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedLetter(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLetter]);

  const displayedMembers = activeTab === "EXECUTIVE"
    ? membersList.filter((m) => m.isExecutive)
    : membersList;

  return (
    <section id="leadership" className="py-24 bg-[#07111F] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5 text-[#D7B65A]" />
              <span>Leadership & Board of Directors</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              TEAM <span className="gold-gradient-text">MAAYON 2026–27</span>
            </h2>
          </div>

          {/* Toggle between Executive and All */}
          <div className="flex items-center space-x-1 sm:space-x-2 bg-white/5 p-1 rounded-full border border-white/10 mt-4 md:mt-0 w-full sm:w-auto justify-center">
            <button
              onClick={() => setActiveTab("EXECUTIVE")}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all ${
                activeTab === "EXECUTIVE"
                  ? "bg-[#D7B65A] text-[#07111F] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Executive Council
            </button>
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all ${
                activeTab === "ALL"
                  ? "bg-[#D7B65A] text-[#07111F] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Board ({TEAM_MEMBERS.length})
            </button>
          </div>
        </div>

        {/* President Spotlight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-12 glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-[#D7B65A]/40 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D7B65A]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0B1728]/80 rounded-2xl border border-[#D7B65A]/20">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-[#D7B65A] to-[#06B6D4] p-1 flex items-center justify-center shadow-xl mb-3 sm:mb-4">
                <div className="w-full h-full rounded-full bg-[#07111F] flex items-center justify-center text-2xl sm:text-3xl font-heading font-extrabold text-[#E8D89A]">
                  HB
                </div>
              </div>

              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white text-center">
                Rtr. Hariharan B
              </h3>
              <div className="text-xs font-bold uppercase tracking-widest text-[#D7B65A] mt-1">
                Club President • 2026–27
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                13th President of Rotaract Club of LIA
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-semibold bg-[#D7B65A]/10 text-[#E8D89A] border border-[#D7B65A]/30">
                <span>Presidential Vision</span>
              </div>

              <h4 className="font-heading font-bold text-xl sm:text-2xl text-white">
                Leading Team MAAYON with Unity, Discipline & Purpose
              </h4>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                Installed during the landmark "THE ONE" 13th Installation Ceremony at Texcity Hall, President Rtr. Hariharan B guides the club into Rotary Year 2026–27. Under his leadership, the club champions verified community action, high-impact youth tournaments, district alignments, and inclusive fellowship across Coimbatore.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-[#D7B65A]" />
                  <span>SNS College of Technology</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>District 3206 Official</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-[#F43F5E]" />
                  <span>Blood Group: O+ve</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Board Members Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {displayedMembers.slice(1).map((member) => {
              const initials = member.name.replace("Rtr. ", "").replace("IPP. ", "").replace("PP. ", "").slice(0, 2).toUpperCase();

              return (
                <motion.div
                  layout
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-heading font-bold text-white text-base group-hover:border-[#D7B65A]/40 transition-colors">
                        {initials}
                      </div>

                      {member.letterImage && (
                        <button
                          onClick={() => setSelectedLetter(member)}
                          className="px-2.5 py-1 rounded-md text-[10px] font-semibold text-[#D7B65A] bg-[#D7B65A]/10 border border-[#D7B65A]/30 hover:bg-[#D7B65A] hover:text-[#07111F] transition-all flex items-center space-x-1"
                          title="View Official Appointment Letter"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Letter</span>
                        </button>
                      )}
                    </div>

                    <h4 className="font-heading font-bold text-lg text-white group-hover:text-[#E8D89A] transition-colors leading-snug">
                      {member.name}
                    </h4>

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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Appointment Letter Modal Preview */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLetter(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="letter-modal-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-2xl w-full glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl z-10 p-3 sm:p-4 max-h-[92vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 px-2">
                <div className="min-w-0 pr-2">
                  <div id="letter-modal-title" className="text-xs sm:text-sm font-heading font-bold text-white truncate">
                    Official Appointment Letter — {selectedLetter.name}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#D7B65A] truncate">{selectedLetter.position} • Rotary Year 2026–27</div>
                </div>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 text-white shrink-0"
                  aria-label="Close letter"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto mt-2 sm:mt-3 p-2 bg-[#07111F] rounded-xl flex items-center justify-center">
                {selectedLetter.letterImage && (
                  <img
                    src={selectedLetter.letterImage}
                    alt={`Appointment letter of ${selectedLetter.name}`}
                    loading="lazy"
                    className="max-h-[65vh] sm:max-h-[72vh] w-auto max-w-full object-contain rounded shadow-lg"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
