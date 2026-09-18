import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Calendar, X, ShieldCheck, ExternalLink } from "lucide-react";
import { PROJECTS } from "../data/projects";
import type { Project } from "../types";
import { getPublishedProjects } from "../services/projects";

function mapSupabaseProjectToPublicProject(dbProj: any): Project {
  return {
    id: dbProj.id,
    title: dbProj.title,
    slug: dbProj.slug,
    category: dbProj.category || "Community Service",
    date: dbProj.project_date || `${dbProj.year || new Date().getFullYear()}`,
    year: dbProj.year || new Date().getFullYear(),
    description: dbProj.description || "",
    shortDescription: dbProj.short_description || dbProj.description || "",
    image: dbProj.cover_image_url || "",
    featured: Boolean(dbProj.featured),
    impactMetrics: dbProj.impact_metrics || undefined,
    collaborators: dbProj.collaborators || undefined,
    source: dbProj.source_platform ? {
      platform: dbProj.source_platform as any,
      url: dbProj.source_url || undefined,
      verified: Boolean(dbProj.source_verified),
    } : undefined,
  };
}

export const FeaturedProjects = () => {
  const [projectsList, setProjectsList] = useState<Project[]>(PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    let isMounted = true;
    getPublishedProjects()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setProjectsList(data.map(mapSupabaseProjectToPublicProject));
        }
      })
      .catch((err) => {
        console.warn("Could not load projects from database, using static fallback:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Asymmetric arrangement:
  const heroProject = projectsList[0] || PROJECTS[0];
  const sideProject1 = projectsList[1] || PROJECTS[1];
  const sideProject2 = projectsList[2] || PROJECTS[2];
  const wideProject = projectsList[3] || PROJECTS[3];

  return (
    <section id="projects" className="py-24 bg-[#0B1728] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#D7B65A] uppercase tracking-wider mb-3">
              <span>Impact in Action</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              FEATURED <span className="gold-gradient-text">PROJECTS</span>
            </h2>
          </div>
          <p className="max-w-md text-slate-400 text-sm sm:text-base mt-4 md:mt-0 font-normal">
            Asymmetric showcase of verified community-led programs, sports development, public healthcare, and youth initiatives.
          </p>
        </div>

        {/* Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Large Hero Project (7 Cols) */}
          {heroProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onClick={() => setSelectedProject(heroProject)}
              className="lg:col-span-7 glass-card rounded-2xl overflow-hidden border border-white/10 group cursor-pointer flex flex-col justify-between transition-all hover:border-[#D7B65A]/40 hover:shadow-2xl"
            >
              <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
                <img
                  src={heroProject.image}
                  alt={heroProject.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-[#0B1728]/30 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#07111F]/80 text-[#10B981] border border-[#10B981]/30 backdrop-blur-md">
                    Featured Initiative
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7 lg:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:space-x-3 text-xs text-slate-400 mb-3">
                    <span className="text-[#D7B65A] font-semibold uppercase">{heroProject.category}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{heroProject.date}</span>
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-white mb-3 group-hover:text-[#E8D89A] transition-colors leading-snug">
                    {heroProject.title}
                  </h3>

                  <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-3 mb-6 font-normal">
                    {heroProject.description}
                  </p>
                </div>

                {heroProject.impactMetrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 py-3 sm:py-4 border-t border-white/10 my-2">
                    {heroProject.impactMetrics.map((m, i) => (
                      <div key={i} className="text-left">
                        <div className="text-base sm:text-lg font-heading font-extrabold text-white">{m.value}</div>
                        <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-white">
                    View Project Details
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#D7B65A] group-hover:text-[#07111F] text-white flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Two Stacked Side Projects (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {[sideProject1, sideProject2].map((proj, idx) => (
              proj && (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  onClick={() => setSelectedProject(proj)}
                  className="glass-card rounded-2xl overflow-hidden border border-white/10 group cursor-pointer flex-1 flex flex-col justify-between hover:border-white/20 transition-all hover:shadow-xl"
                >
                  <div className="relative h-44 sm:h-48 overflow-hidden">
                    <img
                      src={proj.image}
                      alt={proj.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-[#0B1728]/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#07111F]/80 text-[#D7B65A] border border-[#D7B65A]/30 backdrop-blur-md">
                        {proj.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
                        <span>{proj.date}</span>
                      </div>
                      <h4 className="font-heading font-bold text-lg sm:text-xl text-white mb-2 group-hover:text-[#E8D89A] transition-colors leading-snug">
                        {proj.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 font-normal line-clamp-2 leading-relaxed">
                        {proj.shortDescription}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white">
                      <span>Explore</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </div>

          {/* Large Horizontal Project (Full 12 Cols) */}
          {wideProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onClick={() => setSelectedProject(wideProject)}
              className="lg:col-span-12 glass-card rounded-2xl overflow-hidden border border-white/10 group cursor-pointer hover:border-[#EC4899]/40 transition-all hover:shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-span-6 relative h-64 lg:h-80 overflow-hidden">
                  <img
                    src={wideProject.image}
                    alt={wideProject.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-[#0B1728]/70" />
                </div>

                <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 space-y-4">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/30">
                      {wideProject.category}
                    </span>
                    <span>•</span>
                    <span>{wideProject.date}</span>
                  </div>

                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white group-hover:text-[#E8D89A] transition-colors leading-snug">
                    {wideProject.title}
                  </h3>

                  <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
                    {wideProject.description}
                  </p>

                  {wideProject.impactMetrics && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                      {wideProject.impactMetrics.map((m, i) => (
                        <div key={i}>
                          <div className="text-xl font-heading font-extrabold text-white">{m.value}</div>
                          <div className="text-[11px] text-slate-400 uppercase tracking-wider">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white">
                    <span>Read Full Story & Outcomes</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl z-10 max-h-[92vh] flex flex-col"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Banner */}
              <div className="relative h-44 sm:h-60 md:h-72 w-full shrink-0">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-[#0B1728]/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#D7B65A] text-[#07111F]">
                    {selectedProject.category}
                  </span>
                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl text-white mt-1.5 leading-tight">
                    {selectedProject.title}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-5 sm:space-y-6">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-300 border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-[#D7B65A]" />
                    <span>Timeline: {selectedProject.date}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1.5 text-[#10B981]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Rotaract LIA Initiative</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Initiative Narrative</h4>
                  <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-normal">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.impactMetrics && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Outcomes</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {selectedProject.impactMetrics.map((m, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="text-2xl font-heading font-bold text-[#E8D89A]">{m.value}</div>
                          <div className="text-[11px] text-slate-400 uppercase mt-0.5">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.collaborators && selectedProject.collaborators.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Collaborating Entities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.collaborators.map((c, idx) => (
                        <span key={idx} className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-slate-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.source?.url && (
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Official Social Record</span>
                    <a
                      href={selectedProject.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#D7B65A] hover:underline"
                    >
                      <span>View on {selectedProject.source.platform}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
