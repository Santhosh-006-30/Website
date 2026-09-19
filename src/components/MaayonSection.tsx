import React from "react";
import { motion } from "framer-motion";
import { Feather, Sparkles, Shield, Compass, Star } from "lucide-react";
import { CLUB_INFO } from "../data/club";

export const MaayonSection: React.FC = () => {
  return (
    <section
      id="maayon"
      className="py-28 bg-gradient-to-b from-[#07111F] via-[#091526] to-[#07111F] relative overflow-hidden border-y border-[#D7B65A]/20"
    >
      {/* Background radial gold aura & ambient beams */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#D7B65A]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Subtle fine concentric circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div className="w-[500px] h-[500px] rounded-full border border-[#D7B65A]/30" />
        <div className="absolute w-[800px] h-[800px] rounded-full border border-[#D7B65A]/20" />
        <div className="absolute w-[1100px] h-[1100px] rounded-full border border-[#D7B65A]/10" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#10233D]/80 border border-[#D7B65A]/40 backdrop-blur-md shadow-lg shadow-black/20 mb-4"
          >
            <Sparkles className="w-4 h-4 text-[#D7B65A]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8D89A]">
              Presidential Theme • 2026–27
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight"
          >
            THE CHAPTER OF <span className="gold-gradient-text">MAAYON</span>
          </motion.h2>

          <p className="text-slate-300 text-xs sm:text-base mt-3 sm:mt-4 font-normal max-w-xl mx-auto">
            The official presidential identity guiding the Rotaract Club of Lead India Ahead through Rotary Year 2026–27.
          </p>
        </div>

        {/* Cinematic Emblem Showcase Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 border border-[#D7B65A]/30 shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Top corner accents */}
          <div className="absolute top-0 left-0 w-12 sm:w-16 h-12 sm:h-16 border-t-2 border-l-2 border-[#D7B65A]/60 rounded-tl-2xl sm:rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 border-b-2 border-r-2 border-[#D7B65A]/60 rounded-br-2xl sm:rounded-br-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            
            {/* Logo Emblem Presentation */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#07111F]/80 rounded-2xl border border-[#D7B65A]/20 shadow-inner">
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#D7B65A]/20 rounded-full blur-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                <img
                  src="/assets/logos/maayon-theme.png"
                  alt="MAAYON 2026-27 Official Logo"
                  loading="lazy"
                  decoding="async"
                  className="relative h-20 sm:h-28 md:h-36 w-auto object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
                />
              </div>

              <div className="mt-4 sm:mt-6 text-center space-y-1">
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#E8D89A]">
                  Official Theme Insignia
                </div>
                <div className="text-sm sm:text-base font-heading font-bold text-white">
                  Rtr. Hariharan B — President
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400">
                  Rotaract Club of Lead India Ahead
                </div>
              </div>
            </div>

            {/* Content & Theme Statement */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider">
                  <Feather className="w-4 h-4" />
                  <span>Theme Directive</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-white">
                  Purposeful Leadership in Action
                </h3>
              </div>

              {/* Official Theme Message Box (Centralized editable placeholder) */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative">
                <div className="text-xs font-mono uppercase text-[#D7B65A] mb-2 flex items-center space-x-1.5">
                  <Star className="w-3.5 h-3.5" />
                  <span>Theme Statement</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed italic">
                  "{CLUB_INFO.themeStatementPlaceholder}"
                </p>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-3 pt-3 border-t border-white/5 flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                  <span>Authorized by Presidential Office</span>
                  <span className="font-semibold text-white">Rotary Year 2026–27</span>
                </div>
              </div>

              {/* Guiding Tenets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <Compass className="w-5 h-5 text-[#D7B65A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Strategic Focus</h4>
                    <p className="text-[11px] text-slate-400 mt-1">High-accountability community service and sustainable value.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <Shield className="w-5 h-5 text-[#06B6D4] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">District Alignment</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Active collaboration across District 3206 and Rotary Texcity.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
