import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Globe,
  ExternalLink,
  Eye,
  AlertTriangle,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { adminGetCareer } from '../../services/careers';
import type { Career } from '../../types/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const CareerPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminGetCareer(id);
        setCareer(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load opportunity preview');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 text-sm mt-3">Loading opportunity preview...</p>
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-100">Opportunity Not Found</h2>
        <p className="text-slate-400 text-sm mt-1">
          {error || 'The requested opportunity could not be found.'}
        </p>
        <Link
          to="/admin/careers"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Careers
        </Link>
      </div>
    );
  }

  const isDraft = career.status === 'draft';
  const isArchived = career.status === 'archived';
  const isExpired =
    career.application_deadline && new Date(career.application_deadline) < new Date();

  const formatDeadline = (deadlineStr: string | null) => {
    if (!deadlineStr) return 'Rolling basis';
    const d = new Date(deadlineStr);
    return d.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md sticky top-4 z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/careers')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Careers
          </button>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Opportunity Preview
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              career.status === 'published'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : career.status === 'draft'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
            }`}
          >
            {career.status.toUpperCase()}
          </span>

          <Link
            to={`/admin/careers/${career.id}/edit`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] font-bold rounded-xl text-xs transition-all shadow-md"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Opportunity
          </Link>
        </div>
      </div>

      {/* Draft / Archived Notice */}
      {isDraft && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-amber-300 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Draft Preview</p>
            <p className="text-amber-300/80">
              This opportunity is currently in draft mode. It is hidden from the public website and only visible to authorized CMS users.
            </p>
          </div>
        </div>
      )}

      {isArchived && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 flex items-center gap-3 text-purple-300 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Archived Opportunity</p>
            <p className="text-purple-300/80">
              This opportunity is archived and cannot be viewed on the public website.
            </p>
          </div>
        </div>
      )}

      {isExpired && career.status === 'published' && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Application Deadline Passed</p>
            <p className="text-rose-300/80">
              The deadline for this opportunity was {formatDeadline(career.application_deadline)}. It is automatically hidden from public visitors.
            </p>
          </div>
        </div>
      )}

      {/* Main Preview Content Card */}
      <div className="glass-panel rounded-2xl border border-white/10 bg-[#0c192e]/70 p-6 sm:p-8 space-y-8 shadow-2xl">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-start gap-4">
            {career.organization_logo_url ? (
              <img
                src={career.organization_logo_url}
                alt={career.organization_name}
                className="w-16 h-16 rounded-2xl object-contain bg-white/5 p-2 border border-white/10 flex-shrink-0 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-md">
                <Building2 className="w-8 h-8 text-[#D7B65A]" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs bg-[#D7B65A]/15 text-[#D7B65A] border border-[#D7B65A]/30 px-3 py-0.5 rounded-full font-semibold capitalize">
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
                  <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                    ★ Featured
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {career.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#D7B65A]" />
                  {career.organization_name}
                </span>

                {career.organization_website && (
                  <a
                    href={career.organization_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}

                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {career.location || (career.work_mode === 'remote' ? 'Remote' : 'Unspecified')}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA Box */}
          <div className="flex flex-col gap-2 sm:items-end flex-shrink-0">
            <a
              href={career.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer"
            >
              {career.application_label || 'Apply Now'}
              <ExternalLink className="w-4 h-4" />
            </a>
            {career.remuneration && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {career.remuneration}
              </span>
            )}
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Deadline: {formatDeadline(career.application_deadline)}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#D7B65A]" />
            About the Opportunity
          </h2>
          <div
            className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: career.description }}
          />
        </div>

        {/* Responsibilities */}
        {career.responsibilities && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D7B65A]" />
              Key Responsibilities
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-2">
              {career.responsibilities}
            </div>
          </div>
        )}

        {/* Requirements */}
        {career.requirements && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D7B65A]" />
              Requirements & Qualifications
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-2">
              {career.requirements}
            </div>
          </div>
        )}

        {/* Preferred Skills */}
        {career.preferred_skills && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-base font-bold text-white">Preferred Skills & Competencies</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-2">
              {career.preferred_skills}
            </div>
          </div>
        )}

        {/* Benefits */}
        {career.benefits && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-base font-bold text-white">Benefits & What We Offer</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-2">
              {career.benefits}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {career.additional_information && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-base font-bold text-white">Additional Information</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-2">
              {career.additional_information}
            </div>
          </div>
        )}

        {/* Contact / Inquiries */}
        {career.contact_email && (
          <div className="pt-4 border-t border-white/5 text-xs text-slate-400 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-500" />
            <span>
              For questions regarding this opportunity:{' '}
              <a
                href={`mailto:${career.contact_email}`}
                className="text-[#D7B65A] hover:underline font-medium"
              >
                {career.contact_email}
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
