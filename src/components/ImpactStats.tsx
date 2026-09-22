import React from "react";
import { motion } from "framer-motion";
import { Calendar, Layers, Users, Heart } from "lucide-react";

export const ImpactStats: React.FC = () => {
  const stats = [
    {
      id: "years",
      number: "13+",
      label: "YEARS OF JOURNEY",
      detail: "Chartered in 2012, continuously creating youth leadership",
      icon: Calendar,
      color: "from-[#D7B65A] to-[#E8D89A]",
    },
    {
      id: "projects",
      number: "50+",
      label: "COMMUNITY PROJECTS",
      detail: "Sports, health drives, educational seminars & literacy",
      icon: Layers,
      color: "from-[#06B6D4] to-[#38BDF8]",
    },
    {
      id: "volunteers",
      number: "100+",
      label: "ACTIVE VOLUNTEERS",
      detail: "Dedicated student and professional members across colleges",
      icon: Users,
      color: "from-[#10B981] to-[#34D399]",
    },
    {
      id: "impact",
      number: "5,000+",
      label: "LIVES TOUCHED",
      detail: "Grassroots beneficiaries through health, sports & civic initiatives",
      icon: Heart,
      color: "from-[#F43F5E] to-[#FB7185]",
    },
  ];

  return (
    <section id="impact" className="py-20 bg-[#0B1728] relative overflow-hidden">
      {/* Subtle ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#10233D]/70 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-3">
            <span>Collective Achievement</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            MEASURING OUR <span className="gold-gradient-text">COMMUNITY IMPACT</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 font-normal">
            A reflection of over a decade of dedication to social upliftment, youth growth, and community service.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="glass-card glass-card-hover p-6 sm:p-7 rounded-2xl border border-white/10 flex flex-col justify-between relative group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-xl group-hover:bg-[#D7B65A]/10 transition-colors" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-[#D7B65A] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
                      LIA 2012–27
                    </span>
                  </div>

                  <div className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight text-white mb-2">
                    <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.number}
                    </span>
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
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

        <div className="mt-12 text-center">
          <a
            href="/impact"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-[#D7B65A]/15 border border-[#D7B65A]/30 text-xs sm:text-sm font-semibold text-[#D7B65A] hover:text-[#E8D89A] transition-all group shadow-sm"
          >
            <span>Explore Full Impact Archive &amp; Milestones</span>
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};
