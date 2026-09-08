import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Upload, FolderGit2, Trash2, Tag, 
  BarChart3 
} from 'lucide-react';
import { adminGetProject, adminCreateProject, adminUpdateProject } from '../../services/projects';
import { uploadImage } from '../../services/storage';
import type { ImpactMetric } from '../../types/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

export const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Community Service',
    description: '',
    short_description: '',
    project_date: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear(),
    status: 'published' as 'draft' | 'published' | 'archived',
    featured: true,
    cover_image_url: '',
    collaborators: [] as string[],
    impact_metrics: [] as ImpactMetric[],
    source_platform: '',
    source_url: '',
    source_verified: false,
  });

  const [newCollaborator, setNewCollaborator] = useState('');
  const [newMetricLabel, setNewMetricLabel] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      loadProject(id);
    }
  }, [id, isEdit]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      const project = await adminGetProject(projectId);
      if (project) {
        setFormData({
          title: project.title,
          slug: project.slug,
          category: project.category || 'Community Service',
          description: project.description || '',
          short_description: project.short_description || '',
          project_date: project.project_date || new Date().toISOString().split('T')[0],
          year: project.year || new Date().getFullYear(),
          status: project.status,
          featured: project.featured,
          cover_image_url: project.cover_image_url || '',
          collaborators: project.collaborators || [],
          impact_metrics: project.impact_metrics || [],
          source_platform: project.source_platform || '',
          source_url: project.source_url || '',
          source_verified: project.source_verified || false,
        });
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load project');
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEdit && (!prev.slug || prev.slug === generateSlug(prev.title))
        ? generateSlug(title)
        : prev.slug,
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadImage('project-images', id || 'temp', file);
      setFormData((prev) => ({ ...prev, cover_image_url: result.url }));
      showToast.success('Cover image uploaded successfully');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to upload cover image');
    } finally {
      setUploadingImage(false);
    }
  };

  const addCollaborator = () => {
    if (!newCollaborator.trim()) return;
    if (!formData.collaborators.includes(newCollaborator.trim())) {
      setFormData((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, newCollaborator.trim()],
      }));
    }
    setNewCollaborator('');
  };

  const removeCollaborator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index),
    }));
  };

  const addMetric = () => {
    if (!newMetricLabel.trim() || !newMetricValue.trim()) return;
    setFormData((prev) => ({
      ...prev,
      impact_metrics: [
        ...prev.impact_metrics,
        { label: newMetricLabel.trim(), value: newMetricValue.trim() },
      ],
    }));
    setNewMetricLabel('');
    setNewMetricValue('');
  };

  const removeMetric = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      impact_metrics: prev.impact_metrics.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast.error('Please enter a project title');
      return;
    }
    if (!formData.slug.trim()) {
      showToast.error('Please enter a valid slug');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase(),
        category: formData.category,
        description: formData.description.trim() || null,
        short_description: formData.short_description.trim() || null,
        project_date: formData.project_date || null,
        year: Number(formData.year) || new Date().getFullYear(),
        status: formData.status,
        featured: formData.featured,
        cover_image_url: formData.cover_image_url.trim() || null,
        collaborators: formData.collaborators,
        impact_metrics: formData.impact_metrics,
        source_platform: formData.source_platform.trim() || null,
        source_url: formData.source_url.trim() || null,
        source_verified: formData.source_verified,
      };

      if (isEdit && id) {
        await adminUpdateProject(id, payload);
        showToast.success('Project updated successfully');
      } else {
        await adminCreateProject(payload as any);
        showToast.success('Project created successfully');
      }
      navigate('/admin/projects');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 text-sm mt-3">Loading project details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEdit ? 'Edit Project' : 'Create New Project'}
            </h1>
            <p className="text-sm text-slate-400">
              {isEdit ? 'Update project scope, impact metrics, and imagery' : 'Add a signature initiative or community project'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects"
            className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#D7B65A]" />
              Project Details
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Project Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Project Thalir - Green India Initiative"
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Slug <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center">
                <span className="bg-[#07111F]/90 border border-r-0 border-white/10 rounded-l-xl px-3 py-2.5 text-xs text-slate-500 font-mono">
                  /projects/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="project-slug-url"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-r-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Short Tagline / Overview
              </label>
              <textarea
                rows={2}
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="Short summary displayed on public cards..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Detailed Description
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Elaborate on the project goals, implementation, and community outcomes..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#D7B65A]" />
              Impact Metrics & Stats
            </h2>
            <p className="text-xs text-slate-400">
              Add quantifiable metrics achieved by this project (e.g. Beneficiaries: 1,200+).
            </p>

            {formData.impact_metrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {formData.impact_metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <div className="text-xs text-slate-400">{metric.label}</div>
                      <div className="text-sm font-bold text-[#D7B65A]">{metric.value}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMetric(index)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newMetricLabel}
                onChange={(e) => setNewMetricLabel(e.target.value)}
                placeholder="Metric Label (e.g. Beneficiaries)"
                className="w-full sm:w-1/2 bg-[#07111F]/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
              <input
                type="text"
                value={newMetricValue}
                onChange={(e) => setNewMetricValue(e.target.value)}
                placeholder="Value (e.g. 500+)"
                className="w-full sm:w-1/2 bg-[#07111F]/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
              <button
                type="button"
                onClick={addMetric}
                className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer"
              >
                Add Metric
              </button>
            </div>
          </div>

          {/* Collaborators */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#D7B65A]" />
              Partner Clubs & Collaborators
            </h2>

            <div className="flex flex-wrap gap-2">
              {formData.collaborators.map((collab, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7B65A]/10 border border-[#D7B65A]/30 text-[#D7B65A] text-xs font-medium"
                >
                  {collab}
                  <button
                    type="button"
                    onClick={() => removeCollaborator(index)}
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCollaborator();
                  }
                }}
                placeholder="Partner Club / Sponsor Name"
                className="flex-1 bg-[#07111F]/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
              <button
                type="button"
                onClick={addCollaborator}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Status & Attributes */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white">Status & Timeline</h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Community Service, Green, Health"
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.project_date}
                  onChange={(e) => setFormData({ ...formData, project_date: e.target.value })}
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 text-[#D7B65A] focus:ring-0 bg-[#07111F]"
                />
                <span className="text-sm text-white font-medium">Featured Signature Project</span>
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white">Project Cover</h2>

            {formData.cover_image_url ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video">
                  <img
                    src={formData.cover_image_url}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, cover_image_url: '' })}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Remove Cover Image
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-white/20 rounded-xl p-6 text-center space-y-3 bg-[#07111F]/40">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#D7B65A] hover:underline cursor-pointer">
                    <span>Upload image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverUpload}
                      disabled={uploadingImage}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1">JPG, PNG or WEBP up to 10MB</p>
                </div>
                {uploadingImage && <LoadingSpinner size="sm" />}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Or paste image URL
              </label>
              <input
                type="url"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>
          </div>

          {/* Source Verification */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white">Source Verification</h2>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Platform
              </label>
              <input
                type="text"
                value={formData.source_platform}
                onChange={(e) => setFormData({ ...formData, source_platform: e.target.value })}
                placeholder="e.g. Instagram, District Portal"
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Source URL
              </label>
              <input
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>
            <div className="pt-2 border-t border-white/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.source_verified}
                  onChange={(e) => setFormData({ ...formData, source_verified: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 text-[#D7B65A] focus:ring-0 bg-[#07111F]"
                />
                <span className="text-xs text-slate-300">Verified official event record</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
