import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Globe,
  ExternalLink,
  Share2,
  Check,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { getCareerBySlug } from '../services/careers';
import type { Career } from '../types/supabase';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { JoinUs } from './JoinUs';

export const CareerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!slug) return;

    async function load() {
      setLoading(true);
      try {
        const data = await getCareerBySlug(slug!);
        setCareer(data);
        if (data) {
          document.title = `${data.title} at ${data.organization_name} | Rotaract Club of LIA`;
          // Meta description for SEO
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            (metaDesc as HTMLMetaElement).name = 'description';
            document.head.appendChild(metaDesc);
          }
          (metaDesc as HTMLMetaElement).content =
            `${data.title} at ${data.organization_name}. ${
              data.opportunity_type.replace('_', ' ')
            } opportunity — ${data.work_mode.replace('_', '-')} | Apply now on Rotaract Club of Lead India Ahead.`;
        } else {
          document.title = 'Opportunity Not Found | Rotaract Club of LIA';
        }
      } catch (err) {
        console.error('Failed to load career:', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [slug]);

  /**
   * Returns the URL only if it is a safe https:// link.
   * Blocks javascript:, data:, vbscript:, file:, blob:, and bare http://
   */
  const safeBrowsableUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('file:') ||
      lower.startsWith('blob:')
    ) return null;
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) return null;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
      return trimmed;
    } catch {
      return null;
    }
  };

  const safeWebsiteUrl = safeBrowsableUrl(career?.organization_website);

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

  const formatDeadline = (deadlineStr: string | null) => {
    if (!deadlineStr) return 'Rolling Applications';
    const d = new Date(deadlineStr);
    return d.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#D7B65A]/30 selection:text-[#E8D89A] flex flex-col">
      {/* Top Navbar */}
      <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link
              to="/careers"
              className="inline-flex items-center gap-1.5 hover:text-[#D7B65A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Opportunities
            </Link>
            <span>/</span>
            <span className="text-slate-500 truncate max-w-[240px]">
              {career ? career.title : 'Opportunity'}
            </span>
          </div>

          {loading ? (
            <div className="glass-panel rounded-3xl p-12 border border-white/10 bg-[#0c192e]/40 animate-pulse space-y-6">
              <div className="h-8 bg-white/10 rounded-xl w-2/3" />
              <div className="h-4 bg-white/5 rounded-lg w-1/3" />
              <div className="h-48 bg-white/5 rounded-2xl" />
            </div>
          ) : !career ? (
            <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/40 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 mx-auto flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-white">Opportunity Not Found</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                This opportunity may have expired, been filled, or moved. Please explore our other
                active openings.
              </p>
              <div className="pt-2">
                <Link
                  to="/careers"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] font-bold text-xs hover:brightness-110 transition-all shadow-md shadow-[#D7B65A]/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  View All Opportunities
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header Hero Card */}
              <div className="glass-panel rounded-3xl border border-white/10 bg-gradient-to-br from-[#10233D]/80 via-[#0c192e]/90 to-[#07111F] p-6 sm:p-10 shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-white/10">
                  <div className="flex items-start gap-4">
                    {career.organization_logo_url ? (
                      <img
                        src={career.organization_logo_url}
                        alt={career.organization_name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-white/5 p-2 border border-white/10 flex-shrink-0 shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D7B65A] flex-shrink-0 shadow-lg">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-[#D7B65A]/15 text-[#E8D89A] border border-[#D7B65A]/30 px-3 py-0.5 rounded-full font-semibold capitalize">
                          {career.opportunity_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs bg-white/5 text-slate-300 border border-white/10 px-2.5 py-0.5 rounded-full font-medium capitalize">
                          {career.work_mode.replace('_', '-')}
                        </span>
                        {career.experience_level && (
                          <span className="text-xs bg-white/5 text-slate-300 border border-white/10 px-2.5 py-0.5 rounded-full font-medium capitalize">
                            {career.experience_level.replace('_', ' ')}
                          </span>
                        )}
                        {career.featured && (
                          <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-semibold">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                        {career.title}
                      </h1>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                        <span className="font-medium text-white flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#D7B65A]" />
                          {career.organization_name}
                        </span>

                        {career.organization_website && safeWebsiteUrl && (
                          <a
                            href={safeWebsiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            Website
                          </a>
                        )}

                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          {career.location || (career.work_mode === 'remote' ? 'Remote' : 'On-Site')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Action CTAs */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-3 flex-shrink-0">
                    <a
                      href={career.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/25 transition-all cursor-pointer w-full sm:w-auto"
                    >
                      {career.application_label || 'Apply Now'}
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Link Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Key Meta Badges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Remuneration / Stipend
                    </span>
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {career.remuneration || 'Disclosed upon interview / Competitive'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Application Deadline
                    </span>
                    <p className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#D7B65A]" />
                      {formatDeadline(career.application_deadline)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Work Arrangement
                    </span>
                    <p className="text-sm font-semibold text-slate-200 capitalize flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#D7B65A]" />
                      {career.work_mode.replace('_', '-')} • {career.location || 'Location unspecified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Cols: Description & Criteria */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Detailed Description */}
                  <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/60 p-6 sm:p-8 space-y-4 shadow-xl">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#D7B65A]" />
                      About this Opportunity
                    </h2>
                    <div
                      className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(career.description, {
                          ALLOWED_TAGS: [
                            'p','br','strong','em','u','s','h1','h2','h3','h4',
                            'ul','ol','li','blockquote','a','hr','pre','code',
                          ],
                          ALLOWED_ATTR: ['href','target','rel','class'],
                          ALLOW_DATA_ATTR: false,
                          FORBID_TAGS: ['script','style','iframe','form','object','embed'],
                          FORBID_ATTR: ['onerror','onload','onclick','onmouseover','style'],
                          FORCE_BODY: false,
                        }),
                      }}
                    />
                  </div>

                  {/* Responsibilities */}
                  {career.responsibilities && (
                    <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/60 p-6 sm:p-8 space-y-3 shadow-xl">
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#D7B65A]" />
                        Key Responsibilities
                      </h2>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-1">
                        {career.responsibilities}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {career.requirements && (
                    <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/60 p-6 sm:p-8 space-y-3 shadow-xl">
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#D7B65A]" />
                        Qualifications &amp; Requirements
                      </h2>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-1">
                        {career.requirements}
                      </div>
                    </div>
                  )}

                  {/* Preferred Skills */}
                  {career.preferred_skills && (
                    <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/60 p-6 sm:p-8 space-y-3 shadow-xl">
                      <h2 className="text-base font-bold text-white">Preferred Skills & Tools</h2>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-1">
                        {career.preferred_skills}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {career.benefits && (
                    <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/60 p-6 sm:p-8 space-y-3 shadow-xl">
                      <h2 className="text-base font-bold text-white">What We Offer</h2>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-1">
                        {career.benefits}
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  {career.additional_information && (
                    <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/60 p-6 sm:p-8 space-y-3 shadow-xl">
                      <h2 className="text-base font-bold text-white">Additional Notes</h2>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-1">
                        {career.additional_information}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Col: Sticky Sidebar CTA */}
                <div className="space-y-6">
                  {/* Sticky Apply Box */}
                  <div className="glass-panel rounded-3xl border border-white/10 bg-[#0c192e]/80 p-6 space-y-5 sticky top-28 shadow-xl">
                    <div>
                      <h3 className="text-base font-bold text-white">Ready to Apply?</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Submit your candidature directly through the organization&apos;s verified
                        application link.
                      </p>
                    </div>

                    <a
                      href={career.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/25 transition-all cursor-pointer"
                    >
                      {career.application_label || 'Apply Now'}
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {career.contact_email && (
                      <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-1">
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                          Direct Contact
                        </span>
                        <a
                          href={`mailto:${career.contact_email}`}
                          className="text-[#D7B65A] hover:underline flex items-center gap-1.5 break-all font-medium"
                        >
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          {career.contact_email}
                        </a>
                      </div>
                    )}

                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 space-y-1">
                      <span className="font-semibold text-slate-300 block flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D7B65A]" />
                        Rotaract LIA Endorsement
                      </span>
                      <p>
                        This opportunity is vetted by the Rotaract Club of Lead India Ahead to foster
                        constructive professional youth leadership.
                      </p>
                    </div>

                    <button
                      onClick={handleShare}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Link Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share with Friends</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
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
