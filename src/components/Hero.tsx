import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Shield, ChevronRight } from "lucide-react";
import { CLUB_INFO } from "../data/club";

interface HeroProps {
  onExploreClick: () => void;
  onMeetClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onMeetClick }) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-[#07111F]"
    >
      {/* Ambient background glowing orbs */}
      <div className="absolute top-1/4 -left-36 sm:-left-48 w-72 sm:w-96 h-72 sm:h-96 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-1/4 -right-36 sm:-right-48 w-72 sm:w-96 h-72 sm:h-96 bg-[#D7B65A]/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[600px] h-[300px] sm:h-[500px] lg:h-[600px] bg-[#10233D]/60 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 flex flex-col items-center w-full">
        {/* Presidential Chapter Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center justify-center space-x-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#D7B65A]/40 backdrop-blur-md shadow-lg shadow-black/20 mb-6 sm:mb-8 max-w-full"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D7B65A] shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#E8D89A] truncate">
            Current Presidential Chapter • Rotary Year 2026–27
          </span>
        </motion.div>

        {/* Dual Brand Identity Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-col items-center mb-5 sm:mb-6"
        >
          {/* Official MAAYON Crest */}
          <div className="relative group mb-3 sm:mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#D7B65A]/20 via-[#06B6D4]/20 to-[#D7B65A]/20 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-[#0B1728]/80 border border-[#D7B65A]/30 rounded-2xl p-3.5 sm:p-5 backdrop-blur-xl shadow-2xl flex items-center justify-center">
              <img
                src="/assets/logos/maayon-theme.png"
                alt="MAAYON 2026-27 Presidential Theme Logo"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-14 sm:h-20 md:h-24 w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-medium text-slate-400">
            <span>President:</span>
            <span className="font-semibold text-white tracking-wide">
              {CLUB_INFO.president.name}
            </span>
          </div>
        </motion.div>

        {/* Permanent Institutional Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="space-y-3 sm:space-y-4 max-w-4xl w-full"
        >
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-semibold tracking-widest uppercase text-slate-400">
            <span>Since {CLUB_INFO.established}</span>
            <span>•</span>
            <span>{CLUB_INFO.district}</span>
            <span>•</span>
            <span>Coimbatore</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-[1.12] sm:leading-[1.1]">
            LEAD WITH PURPOSE. <br />
            <span className="gold-gradient-text">CREATE LASTING IMPACT.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed pt-1 sm:pt-2 px-2">
            The official community of the <span className="text-white font-medium">Rotaract Club of Lead India Ahead</span>. 
            Empowering youth through leadership, community service, fellowship, and professional innovation.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 w-full sm:w-auto"
        >
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-7 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-[#07111F] bg-gradient-to-r from-[#D7B65A] via-[#E8D89A] to-[#D7B65A] hover:shadow-[0_0_30px_rgba(215,182,90,0.5)] transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2 group"
          >
            <span>Explore Our Impact</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onMeetClick}
            className="w-full sm:w-auto px-7 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-medium text-slate-200 bg-white/[0.04] border border-white/15 hover:bg-white/10 hover:border-white/30 backdrop-blur-md transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2"
          >
            <Shield className="w-4 h-4 text-[#D7B65A]" />
            <span>Meet LIA</span>
          </button>
        </motion.div>

        {/* Floating Glass Metadata Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-10 sm:mt-14 w-full max-w-3xl glass-card rounded-2xl p-4 sm:p-5 border border-white/10"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="pt-2 sm:pt-0">
              <div className="text-lg sm:text-2xl font-heading font-bold text-[#E8D89A]">2012</div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Established</div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-lg sm:text-2xl font-heading font-bold text-white">Dist. 3206</div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Rotaract District</div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-lg sm:text-2xl font-heading font-bold text-white">90062</div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Club ID • Grp 1/4</div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-lg sm:text-2xl font-heading font-bold text-[#06B6D4]">Texcity</div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Sponsor Rotary Club</div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.a
          href="#about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="inline-flex flex-col items-center mt-12 text-slate-500 hover:text-[#D7B65A] transition-colors group cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest mb-1.5">Scroll to explore</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </motion.a>
      </div>
    </section>
  );
};
