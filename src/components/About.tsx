import { motion } from "framer-motion";
import { Users, Award, Compass, HeartHandshake, CheckCircle2 } from "lucide-react";

export const About = () => {
  const pillars = [
    {
      icon: Users,
      title: "Youth Leadership",
      desc: "Nurturing proactive decision-makers and community advocates equipped for global leadership.",
    },
    {
      icon: HeartHandshake,
      title: "Community Service",
      desc: "Executing grassroots initiatives across healthcare, child welfare, environmental care, and sports.",
    },
    {
      icon: Compass,
      title: "Fellowship & Unity",
      desc: "Building lifelong connections among dynamic students and ambitious young professionals.",
    },
    {
      icon: Award,
      title: "Professional Excellence",
      desc: "Providing high-impact workshops in technology, management, communication, and creative media.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-[#07111F] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Editorial Display Typography */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider">
              <span>About Our Movement</span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
              MORE THAN <br />
              <span className="gold-gradient-text">A CLUB.</span>
            </h2>

            <div className="p-4 sm:p-6 glass-card rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D7B65A]/10 rounded-full blur-2xl -z-10" />
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4 mb-4">
                <img
                  src="/assets/logos/lia-shield.png"
                  alt="Rotaract Club of Lead India Ahead Official Shield Crest"
                  loading="lazy"
                  className="h-12 sm:h-16 w-auto object-contain shrink-0"
                />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Permanent Identity</div>
                  <div className="text-[11px] sm:text-xs text-[#E8D89A] font-medium">Since 2012 • 13+ Years of Journey</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400">Sponsored by Rotary Club of Coimbatore Texcity</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed border-t border-white/10 pt-3">
                Chartered under Rotaract District 3206 (Club ID: 90062), Lead India Ahead serves as a vital platform for youth to learn, lead, and serve with enduring purpose.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Narrative & Pillars */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              <p className="text-white font-medium text-lg sm:text-xl leading-snug">
                Since 2012, the Rotaract Club of Lead India Ahead has brought together passionate young changemakers to learn, lead, and serve.
              </p>
              <p>
                We are a team of students and working professionals dedicated to transforming communities and cultivating future-ready leaders. Operating within Rotaract District 3206 and proudly sponsored by the Rotary Club of Coimbatore Texcity, our initiatives bridge youth passion with institutional accountability.
              </p>
            </div>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {pillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 glass-card glass-card-hover rounded-xl border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#D7B65A] mb-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-heading font-bold text-white text-base mb-1.5">{item.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 text-[#10B981]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified District 3206 Club</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center space-x-1.5 text-[#06B6D4]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Rotary Texcity Family</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center space-x-1.5 text-[#E8D89A]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Since 2012</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
