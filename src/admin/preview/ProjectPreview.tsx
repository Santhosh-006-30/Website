import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Eye, AlertTriangle 
} from 'lucide-react';
import { adminGetProject, adminGetProjectImages } from '../../services/projects';
import type { Project, ProjectImage } from '../../types/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const ProjectPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [projectData, imgData] = await Promise.all([
          adminGetProject(id),
          adminGetProjectImages(id),
        ]);
        setProject(projectData);
        setImages(imgData);
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 text-sm mt-3">Loading project preview...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-100">Project Not Found</h2>
        <p className="text-slate-400 text-sm mt-1">{error || 'The requested project could not be found.'}</p>
        <Link
          to="/admin/projects"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
      </div>
    );
  }

  const isDraft = project.status === 'draft';
  const isArchived = project.status === 'archived';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md sticky top-4 z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/projects')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to CMS
          </button>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Live Preview
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            project.status === 'published'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : project.status === 'draft'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
          }`}>
            {project.status.toUpperCase()}
          </span>

          <Link
            to={`/admin/projects/${project.id}/edit`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Project
          </Link>
        </div>
      </div>

      {/* Draft Warning */}
      {(isDraft || isArchived) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block mb-0.5">
              PREVIEW MODE — THIS PROJECT IS {project.status.toUpperCase()}
            </span>
            This flagship initiative is currently hidden from the public website until published.
          </div>
        </div>
      )}

      {/* Preview Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        {project.cover_image_url && (
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold rounded-full uppercase tracking-wider">
              {project.category}
            </span>
            {project.featured && (
              <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-full">
                ⭐ Flagship Project
              </span>
            )}
            {project.year && (
              <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-full">
                Year: {project.year}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 leading-tight">
            {project.title}
          </h1>

          {/* Impact Metrics */}
          {project.impact_metrics && project.impact_metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-800">
              {project.impact_metrics.map((metric, idx) => (
                <div key={idx} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-center">
                  <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono">
                    {metric.value}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Project Overview
            </h3>
            <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-line">
              {project.description || project.short_description || 'No project description provided.'}
            </div>
          </div>

          {/* Collaborators */}
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-1">Partners &amp; Collaborators:</span>
              <div className="flex flex-wrap gap-2">
                {project.collaborators.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Project Gallery ({images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group"
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption || 'Project image'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-sm p-1.5 text-[11px] text-slate-300 truncate">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
