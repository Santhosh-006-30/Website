import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronRight, ChevronLeft, Award } from "lucide-react";
import { MILESTONES } from "../data/journey";

export const Journey: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="journey" className="py-24 bg-[#0B1728] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5 text-[#D7B65A]" />
              <span>Institutional Evolution</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              OUR <span className="gold-gradient-text">JOURNEY</span>
            </h2>
          </div>
          <p className="max-w-md text-slate-400 text-sm sm:text-base mt-4 md:mt-0 font-normal">
            From our founding in 2012 under Rotary Club of Coimbatore Texcity to the dynamic MAAYON chapter of 2026–27.
          </p>
        </div>

        {/* Desktop Interactive Horizontal Timeline */}
        <div className="hidden lg:block">
          {/* Timeline Track */}
          <div className="relative mb-12">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#D7B65A] via-[#06B6D4] to-[#E8D89A] -translate-y-1/2 transition-all duration-500"
              style={{ width: `${(activeIndex / (MILESTONES.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
              {MILESTONES.map((m, idx) => {
                const isActive = activeIndex === idx;
                const isPassed = activeIndex >= idx;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className="flex flex-col items-center group focus:outline-none"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-sm transition-all duration-300 ${
                        isActive
                          ? "bg-[#D7B65A] text-[#07111F] scale-125 shadow-[0_0_20px_rgba(215,182,90,0.6)]"
                          : isPassed
                          ? "bg-[#10233D] text-[#E8D89A] border-2 border-[#D7B65A]"
                          : "bg-[#07111F] text-slate-400 border border-white/20 group-hover:border-white/50"
                      }`}
                    >
                      {m.year.slice(0, 4)}
                    </div>
                    <span
                      className={`text-xs mt-3 font-semibold tracking-wider uppercase transition-colors ${
                        isActive ? "text-[#E8D89A]" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {m.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Milestone Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="glass-card rounded-3xl p-8 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden"
            >
              <div className="grid grid-cols-12 gap-8 items-center">
                <div className="col-span-8 space-y-4">
                  <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase text-[#D7B65A]">
                    <Award className="w-4 h-4" />
                    <span>Milestone Year: {MILESTONES[activeIndex].year}</span>
                  </div>

                  <h3 className="font-heading font-extrabold text-3xl text-white">
                    {MILESTONES[activeIndex].title}
                  </h3>

                  <p className="text-slate-300 text-base leading-relaxed font-normal">
                    {MILESTONES[activeIndex].description}
                  </p>

                  <div className="pt-4 flex items-center space-x-4">
                    <button
                      disabled={activeIndex === 0}
                      onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                      className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeIndex + 1} of {MILESTONES.length}
                    </span>
                    <button
                      disabled={activeIndex === MILESTONES.length - 1}
                      onClick={() => setActiveIndex((prev) => Math.min(MILESTONES.length - 1, prev + 1))}
                      className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="col-span-4 flex justify-center">
                  {MILESTONES[activeIndex].image ? (
                    <div className="relative p-3 bg-white/5 border border-white/10 rounded-2xl overflow-hidden max-h-56">
                      <img
                        src={MILESTONES[activeIndex].image}
                        alt={MILESTONES[activeIndex].title}
                        className="h-44 w-auto object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                      <div className="text-4xl font-heading font-extrabold text-[#D7B65A] mb-2">
                        {MILESTONES[activeIndex].year}
                      </div>
                      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        {MILESTONES[activeIndex].category}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile & Tablet Vertical Timeline */}
        <div className="lg:hidden space-y-6 relative before:absolute before:inset-0 before:left-3.5 sm:before:left-5 before:w-0.5 before:bg-white/10">
          {MILESTONES.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative pl-8 sm:pl-12"
            >
              <div className="absolute left-2.5 sm:left-3.5 top-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#D7B65A] border-2 sm:border-4 border-[#07111F] -translate-x-1/2 shadow" />
              
              <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-heading font-bold text-[#E8D89A] text-sm sm:text-base">{m.year}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] uppercase font-semibold bg-white/5 text-slate-400">
                    {m.category}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-base sm:text-lg text-white leading-snug">{m.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{m.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
