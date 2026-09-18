import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
  ArrowLeft,
  Save,
  Upload,
  Briefcase,
  Building2,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Mail,
  ExternalLink,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Eye,
} from 'lucide-react';
import {
  adminGetCareer,
  adminCreateCareer,
  adminUpdateCareer,
  generateSlug,
  validateApplicationUrl,
  checkSlugAvailability,
} from '../../services/careers';
import { uploadImage } from '../../services/storage';
import type {
  CareerOpportunityType,
  CareerWorkMode,
  CareerExperienceLevel,
  CareerStatus,
} from '../../types/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

export const CareerForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    organization_name: '',
    organization_website: '',
    organization_logo_url: '',
    opportunity_type: 'job' as CareerOpportunityType,
    work_mode: 'on_site' as CareerWorkMode,
    location: '',
    experience_level: 'entry_level' as CareerExperienceLevel,
    remuneration: '',
    application_deadline: '',
    application_url: '',
    application_label: 'Apply Now',
    responsibilities: '',
    requirements: '',
    preferred_skills: '',
    benefits: '',
    additional_information: '',
    contact_email: '',
    status: 'draft' as CareerStatus,
    featured: false,
  });

  // Tiptap for description ONLY
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#D7B65A] underline hover:text-[#e4c975] cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Provide comprehensive details about the role, background, team, or opportunity...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none text-slate-200 min-h-[220px] p-4 focus:outline-none text-sm leading-relaxed',
      },
    },
  });

  const loadCareer = useCallback(
    async (careerId: string) => {
      setLoading(true);
      try {
        const career = await adminGetCareer(careerId);
        if (career) {
          setFormData({
            title: career.title,
            slug: career.slug,
            organization_name: career.organization_name,
            organization_website: career.organization_website || '',
            organization_logo_url: career.organization_logo_url || '',
            opportunity_type: career.opportunity_type,
            work_mode: career.work_mode,
            location: career.location || '',
            experience_level: (career.experience_level || 'entry_level') as CareerExperienceLevel,
            remuneration: career.remuneration || '',
            application_deadline: career.application_deadline
              ? career.application_deadline.slice(0, 10)
              : '',
            application_url: career.application_url,
            application_label: career.application_label || 'Apply Now',
            responsibilities: career.responsibilities || '',
            requirements: career.requirements || '',
            preferred_skills: career.preferred_skills || '',
            benefits: career.benefits || '',
            additional_information: career.additional_information || '',
            contact_email: career.contact_email || '',
            status: career.status,
            featured: career.featured,
          });

          if (editor && career.description) {
            editor.commands.setContent(career.description);
          }
        }
      } catch (err: any) {
        showToast.error(err.message || 'Failed to load opportunity');
        navigate('/admin/careers');
      } finally {
        setLoading(false);
      }
    },
    [editor, navigate]
  );

  useEffect(() => {
    if (isEdit && id) {
      void loadCareer(id);
    }
  }, [id, isEdit, loadCareer]);

  useEffect(() => {
    if (editor && isEdit && id && !loading) {
      adminGetCareer(id).then((c) => {
        if (c?.description && editor.isEmpty) {
          editor.commands.setContent(c.description);
        }
      });
    }
  }, [editor, isEdit, id, loading]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug:
        !isEdit && (!prev.slug || prev.slug === generateSlug(prev.title))
          ? generateSlug(title)
          : prev.slug,
    }));
  };

  const handleSlugBlur = async () => {
    if (!formData.slug.trim()) return;
    setSlugChecking(true);
    try {
      const isAvailable = await checkSlugAvailability(formData.slug.trim(), id);
      if (!isAvailable) {
        setSlugError('This slug is already in use. Please choose another.');
      } else {
        setSlugError(null);
      }
    } finally {
      setSlugChecking(false);
    }
  };

  const handleApplicationUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, application_url: val }));
    if (val.trim()) {
      const result = validateApplicationUrl(val);
      setUrlError(result.valid ? null : result.error || 'Invalid URL');
    } else {
      setUrlError(null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const result = await uploadImage('gallery-images', 'organization-logos', file);
      setFormData((prev) => ({ ...prev, organization_logo_url: result.url }));
      showToast.success('Organization logo uploaded successfully');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const setEditorLink = () => {
    if (!editor) return;
    const prevUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', prevUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleSubmit = async (e: React.FormEvent, overrideStatus?: CareerStatus) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast.error('Please enter the opportunity title');
      return;
    }
    if (!formData.slug.trim()) {
      showToast.error('Please enter a valid slug');
      return;
    }
    if (!formData.organization_name.trim()) {
      showToast.error('Please enter the organization name');
      return;
    }

    const urlCheck = validateApplicationUrl(formData.application_url);
    if (!urlCheck.valid) {
      setUrlError(urlCheck.error || 'Invalid application URL');
      showToast.error(urlCheck.error || 'Invalid application URL');
      return;
    }

    const descriptionHtml = editor?.getHTML() || '';
    if (!descriptionHtml.trim() || descriptionHtml === '<p></p>') {
      showToast.error('Please provide a description of the opportunity');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase(),
        organization_name: formData.organization_name.trim(),
        organization_website: formData.organization_website.trim() || null,
        organization_logo_url: formData.organization_logo_url.trim() || null,
        opportunity_type: formData.opportunity_type,
        work_mode: formData.work_mode,
        location: formData.location.trim() || null,
        experience_level: formData.experience_level || null,
        remuneration: formData.remuneration.trim() || null,
        application_deadline: formData.application_deadline
          ? new Date(formData.application_deadline).toISOString()
          : null,
        application_url: formData.application_url.trim(),
        application_label: formData.application_label.trim() || 'Apply Now',
        description: descriptionHtml,
        responsibilities: formData.responsibilities.trim() || null,
        requirements: formData.requirements.trim() || null,
        preferred_skills: formData.preferred_skills.trim() || null,
        benefits: formData.benefits.trim() || null,
        additional_information: formData.additional_information.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        status: overrideStatus || formData.status,
        featured: formData.featured,
      };

      if (isEdit && id) {
        await adminUpdateCareer(id, payload);
        showToast.success('Opportunity updated successfully');
      } else {
        await adminCreateCareer(payload as any);
        showToast.success('Opportunity created successfully');
      }
      navigate('/admin/careers');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner label="Loading opportunity details..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/careers"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-[#D7B65A]" />
              {isEdit ? 'Edit Opportunity' : 'New Opportunity'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? 'Update details for this posting' : 'Create a new opportunity for members & visitors'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEdit && id && (
            <Link
              to={`/admin/preview/career/${id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
          )}

          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {/* Section 1: Role Overview */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
          <h2 className="text-sm font-semibold text-[#D7B65A] uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Role & Identification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Opportunity Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Associate Software Engineer, Marketing Intern"
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 transition-colors"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>
                  URL Slug <span className="text-rose-400">*</span>
                </span>
                {slugChecking && <span className="text-[11px] text-slate-400">Checking...</span>}
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, slug: generateSlug(e.target.value) }))
                }
                onBlur={handleSlugBlur}
                placeholder="associate-software-engineer"
                className={`w-full bg-[#07111F]/80 border ${
                  slugError ? 'border-rose-500/60' : 'border-white/10'
                } rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-[#D7B65A]/60 transition-colors`}
              />
              {slugError ? (
                <p className="text-rose-400 text-xs mt-1">{slugError}</p>
              ) : (
                <p className="text-slate-500 text-[11px] mt-1 font-mono">
                  Public URL: /careers/{formData.slug || 'your-slug'}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Opportunity Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Opportunity Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.opportunity_type}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    opportunity_type: e.target.value as CareerOpportunityType,
                  }))
                }
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60 capitalize"
              >
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="volunteer">Volunteer</option>
                <option value="project_role">Project Role</option>
                <option value="fellowship">Fellowship</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Mode <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.work_mode}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    work_mode: e.target.value as CareerWorkMode,
                  }))
                }
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60 capitalize"
              >
                <option value="on_site">On-Site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Experience Level
              </label>
              <select
                value={formData.experience_level}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    experience_level: e.target.value as CareerExperienceLevel,
                  }))
                }
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60 capitalize"
              >
                <option value="entry_level">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="mid_level">Mid Level</option>
                <option value="senior_level">Senior Level</option>
                <option value="not_applicable">Not Applicable</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Coimbatore, Tamil Nadu"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Remuneration / Stipend */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Remuneration / Stipend
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.remuneration}
                  onChange={(e) => setFormData((p) => ({ ...p, remuneration: e.target.value }))}
                  placeholder="e.g. ₹20,000 / month, Unpaid"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Application Deadline
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, application_deadline: e.target.value }))
                  }
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Leave empty for ongoing / rolling applications
              </p>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contact Email (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData((p) => ({ ...p, contact_email: e.target.value }))}
                  placeholder="careers@company.com"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Organization Info */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
          <h2 className="text-sm font-semibold text-[#D7B65A] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Organization Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Organization Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Organization Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.organization_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, organization_name: e.target.value }))
                }
                placeholder="e.g. Acme Innovations Pvt Ltd"
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>

            {/* Organization Website */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Organization Website
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={formData.organization_website}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, organization_website: e.target.value }))
                  }
                  placeholder="https://company.com"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>

            {/* Organization Logo */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Organization Logo
              </label>
              <div className="flex items-center gap-3">
                {formData.organization_logo_url ? (
                  <img
                    src={formData.organization_logo_url}
                    alt="Logo preview"
                    className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1 border border-white/10 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                )}
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Application Destination */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
          <h2 className="text-sm font-semibold text-[#D7B65A] uppercase tracking-wider flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Application Destination
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Application URL (Required, HTTPS only) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Application URL (HTTPS Only) <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.application_url}
                onChange={handleApplicationUrlChange}
                placeholder="https://jobs.company.com/apply/123"
                className={`w-full bg-[#07111F]/80 border ${
                  urlError ? 'border-rose-500/70' : 'border-white/10'
                } rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60`}
              />
              {urlError ? (
                <p className="text-rose-400 text-xs mt-1">{urlError}</p>
              ) : (
                <p className="text-slate-500 text-[11px] mt-1">
                  Must begin with https:// — redirect applicants directly to your application portal or form.
                </p>
              )}
            </div>

            {/* Application Button Label */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Button Label
              </label>
              <input
                type="text"
                value={formData.application_label}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, application_label: e.target.value }))
                }
                placeholder="Apply Now"
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Role Description (Rich Text via Tiptap) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#D7B65A] uppercase tracking-wider">
              Role Description <span className="text-rose-400">*</span>
            </h2>
            <span className="text-[11px] text-slate-400">Rich Text Editor</span>
          </div>

          {/* Tiptap Toolbar */}
          {editor && (
            <div className="flex flex-wrap items-center gap-1 p-2 bg-[#07111F]/90 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  editor.isActive('bold')
                    ? 'bg-[#D7B65A] text-[#07111F]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  editor.isActive('italic')
                    ? 'bg-[#D7B65A] text-[#07111F]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  editor.isActive('underline')
                    ? 'bg-[#D7B65A] text-[#07111F]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Underline"
              >
                <UnderlineIcon className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-white/10 mx-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  editor.isActive('heading', { level: 2 })
                    ? 'bg-[#D7B65A] text-[#07111F]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  editor.isActive('heading', { level: 3 })
                    ? 'bg-[#D7B65A] text-[#07111F]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Heading 3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-white/10 mx-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  editor.isActive('bulletList')
                    ? 'bg-[#D7B65A] text-[#07111F]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  editor.isActive('orderedList')
                    ? 'bg-[#D7B65A] text-[#07111F]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  editor.isActive('blockquote')
                    ? 'bg-[#D7B65A] text-[#07111F]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Quote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-white/10 mx-1" />

              <button
                type="button"
                onClick={setEditorLink}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  editor.isActive('link')
                    ? 'bg-[#D7B65A] text-[#07111F]'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Link"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                title="Undo"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                title="Redo"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="border border-white/10 rounded-xl bg-[#07111F]/80 overflow-hidden focus-within:border-[#D7B65A]/60 transition-colors">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Section 5: Supporting Sections (Plain Textareas per instruction) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
          <h2 className="text-sm font-semibold text-[#D7B65A] uppercase tracking-wider">
            Supporting Details & Criteria
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsibilities */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Key Responsibilities
              </label>
              <textarea
                rows={4}
                value={formData.responsibilities}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, responsibilities: e.target.value }))
                }
                placeholder="List main duties and daily tasks..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 resize-y"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Minimum Requirements
              </label>
              <textarea
                rows={4}
                value={formData.requirements}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, requirements: e.target.value }))
                }
                placeholder="Qualifications, core prerequisites, degrees, or certifications..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 resize-y"
              />
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Skills & Technologies
              </label>
              <textarea
                rows={4}
                value={formData.preferred_skills}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, preferred_skills: e.target.value }))
                }
                placeholder="Tools, languages, soft skills, or extra competencies..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 resize-y"
              />
            </div>

            {/* Benefits & Perks */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Benefits & Perks
              </label>
              <textarea
                rows={4}
                value={formData.benefits}
                onChange={(e) => setFormData((p) => ({ ...p, benefits: e.target.value }))}
                placeholder="Mentorship, recommendation letters, flexible hours, health coverage..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 resize-y"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Additional Information / Note to Applicants
            </label>
            <textarea
              rows={3}
              value={formData.additional_information}
              onChange={(e) =>
                setFormData((p) => ({ ...p, additional_information: e.target.value }))
              }
              placeholder="Any instructions about interviews, test tasks, or equal opportunity statements..."
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 resize-y"
            />
          </div>
        </div>

        {/* Section 6: Publishing & Visibility */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
          <h2 className="text-sm font-semibold text-[#D7B65A] uppercase tracking-wider">
            Publishing & Visibility
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Publication Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, status: e.target.value as CareerStatus }))
                }
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60 capitalize"
              >
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="published">Published (Visible Publicly)</option>
                <option value="archived">Archived (Inactive)</option>
              </select>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, featured: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D7B65A]"></div>
              </label>
              <span className="text-xs font-medium text-slate-300">
                Feature on Homepage & Top of Careers Listing
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Link
            to="/admin/careers"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
};
