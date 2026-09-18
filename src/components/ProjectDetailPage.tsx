import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  Share2,
  Check,
  ShieldCheck,
  ExternalLink,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { getPublishedProjectBySlug } from '../services/projects';
import { PROJECTS } from '../data/projects';
import type { Project as PublicProject } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';
import { SEO } from './SEO';
import { SITE_CONFIG, getAbsoluteImageUrl } from '../config/site';

function mapDbProjectToPublicProject(dbProj: any): PublicProject {
  return {
    id: dbProj.id,
    title: dbProj.title,
    slug: dbProj.slug,
    category: dbProj.category || 'Community Service',
    date: dbProj.project_date || `${dbProj.year || new Date().getFullYear()}`,
    year: dbProj.year || new Date().getFullYear(),
    description: dbProj.description || '',
    shortDescription: dbProj.short_description || dbProj.description || '',
    image: dbProj.cover_image_url || '',
    featured: Boolean(dbProj.featured),
    impactMetrics: dbProj.impact_metrics || undefined,
    collaborators: dbProj.collaborators || undefined,
    source: dbProj.source_platform
      ? {
          platform: dbProj.source_platform as any,
          url: dbProj.source_url || undefined,
          verified: Boolean(dbProj.source_verified),
        }
      : undefined,
  };
}

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!slug) return;

    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const dbProj = await getPublishedProjectBySlug(slug!);
        if (isMounted && dbProj) {
          setProject(mapDbProjectToPublicProject(dbProj));
          return;
        }

        const staticProj = PROJECTS.find((p) => p.slug === slug);
        if (isMounted) {
          setProject(staticProj || null);
        }
      } catch (err) {
        console.warn('Could not fetch project from database, trying static fallback:', err);
        const staticProj = PROJECTS.find((p) => p.slug === slug);
        if (isMounted) {
          setProject(staticProj || null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error('Failed to copy share link:', e);
    }
  };

  const safeSourceUrl = (url?: string): string | null => {
    if (!url) return null;
    const lower = url.trim().toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      return url.trim();
    }
    return null;
  };

  const projectJsonLd = project
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: project.title,
        description: project.shortDescription || project.description,
        image: getAbsoluteImageUrl(project.image),
        publisher: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.siteUrl,
        },
      }
    : undefined;

  const relatedProjects = project
    ? PROJECTS.filter((p) => p.slug !== project.slug)
        .sort((a, _b) => (a.category === project.category ? -1 : 1))
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#D7B65A]/30 selection:text-[#E8D89A] flex flex-col">
      <SEO
        title={
          loading
            ? 'Loading Project...'
            : project
              ? `${project.title} — Signature Project`
              : 'Project Not Found'
        }
        description={
          project
            ? `${project.title}. ${project.shortDescription || project.description} Rotaract Club of Lead India Ahead.`
            : 'Explore verified community initiatives, youth empowerment programs, and signature projects of Rotaract LIA.'
        }
        canonicalPath={project ? `/projects/${project.slug}` : undefined}
        ogImage={project?.image || null}
        noindex={!loading && !project}
        jsonLd={projectJsonLd}
      />

      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 hover:text-[#D7B65A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Projects &amp; Initiatives
            </Link>
            <span>/</span>
            <span className="text-slate-500 truncate max-w-[240px]">
              {project ? project.title : 'Project Record'}
            </span>
          </div>

          {loading ? (
            <div className="glass-panel rounded-3xl p-12 border border-white/10 bg-[#0c192e]/40 animate-pulse space-y-6">
              <div className="h-8 bg-white/10 rounded-xl w-2/3" />
              <div className="h-4 bg-white/5 rounded-lg w-1/3" />
              <div className="h-64 bg-white/5 rounded-2xl" />
            </div>
          ) : !project ? (
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/40 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white">Project Record Not Found</h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                The requested project record could not be found or may have been archived. Please explore our verified initiatives on the main showcase.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] font-bold text-xs hover:brightness-110 transition-all shadow-md shadow-[#D7B65A]/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Explore All Projects
                </Link>
                <Link
                  to="/careers"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-colors"
                >
                  View Opportunities
                </Link>
              </div>
            </div>
          ) : (
            <article className="space-y-8">
              {/* Project Hero Card */}
              <div className="glass-panel rounded-3xl border border-white/10 bg-gradient-to-br from-[#10233D]/90 via-[#0c192e]/90 to-[#07111F] overflow-hidden shadow-2xl">
                {/* Visual Banner */}
                {project.image && (
                  <div className="relative h-64 sm:h-96 w-full overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c192e] via-[#0c192e]/40 to-transparent" />
                  </div>
                )}

                <div className="p-6 sm:p-10 space-y-6">
                  {/* Top Badges & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border text-[#D7B65A] bg-[#D7B65A]/15 border-[#D7B65A]/40">
                        {project.category}
                      </span>
                      {project.source?.verified && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified Initiative
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                        title="Share project record"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-[#D7B65A]" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Title & Timeline */}
                  <div className="space-y-2">
                    <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                      {project.title}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-[#D7B65A]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{project.date}</span>
                      <span>•</span>
                      <span>Rotary Year {project.year}</span>
                    </div>
                  </div>

                  {/* Impact Metrics Grid */}
                  {project.impactMetrics && project.impactMetrics.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#10B981]" />
                        <span>Key Impact Metrics</span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {project.impactMetrics.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center"
                          >
                            <span className="block text-xl sm:text-2xl font-black text-[#D7B65A] font-heading">
                              {m.value}
                            </span>
                            <span className="block text-xs text-slate-400 mt-1">
                              {m.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Description */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#D7B65A]">
                      Initiative Narrative &amp; Community Impact
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {project.description || project.shortDescription}
                    </p>
                  </div>

                  {/* Collaborators */}
                  {project.collaborators && project.collaborators.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#D7B65A]" />
                        Collaborators &amp; Partner Organizations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.collaborators.map((partner, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-200"
                          >
                            {partner}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verified Source / Publication */}
                  {project.source && safeSourceUrl(project.source.url) && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Verified Documentation: {project.source.platform}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Authenticated project activities and social records
                          </p>
                        </div>
                      </div>

                      <a
                        href={safeSourceUrl(project.source.url)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        <span>View Documentation</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#D7B65A]" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )}

          {/* Related Projects Section */}
          {!loading && project && relatedProjects.length > 0 && (
            <section className="pt-8 border-t border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#D7B65A] mb-1">
                    More From Rotaract LIA
                  </h2>
                  <h3 className="font-heading font-bold text-xl text-white">
                    Related Signature Initiatives
                  </h3>
                </div>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D7B65A] hover:text-[#E8D89A] transition-colors"
                >
                  <span>View All Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedProjects.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/projects/${rel.slug}`}
                    className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-white/10 group flex flex-col justify-between"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={rel.image || '/assets/events/the-one.jpg'}
                        alt={rel.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-300">
                        <span>{rel.date}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-[#D7B65A]">
                          {rel.category}
                        </div>
                        <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#E8D89A] transition-colors line-clamp-1">
                          {rel.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {rel.shortDescription || rel.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-[#D7B65A]">
                        <span>Explore Project</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <JoinUs
        isModalOpen={isJoinModalOpen}
        onCloseModal={() => setIsJoinModalOpen(false)}
        onOpenModal={() => setIsJoinModalOpen(true)}
      />

      <Footer onOpenJoinModal={() => setIsJoinModalOpen(true)} />
    </div>
  );
};
