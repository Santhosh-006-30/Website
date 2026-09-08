import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, Save, Sparkles, 
  Layers, Compass, HeartHandshake 
} from 'lucide-react';
import { adminGetAllContent, adminUpsertContent } from '../../services/content';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

type SectionKey = 'hero' | 'about' | 'impact' | 'what_we_do' | 'join' | 'footer';

interface ContentSectionConfig {
  id: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'textarea';
    placeholder: string;
    rows?: number;
    hint?: string;
  }>;
}

const SECTION_CONFIGS: ContentSectionConfig[] = [
  {
    id: 'hero',
    label: 'Hero Section',
    icon: Sparkles,
    fields: [
      { key: 'badge', label: 'Badge Text', type: 'text', placeholder: 'District 3234 • Rotary International' },
      { key: 'title', label: 'Main Headline', type: 'text', placeholder: 'Empowering Youth, Leading Positive Change' },
      { key: 'subtitle', label: 'Subtitle / Description', type: 'textarea', rows: 3, placeholder: 'Rotaract Club of Lead India Ahead is dedicated to youth leadership, community development, and humanitarian service.' },
      { key: 'cta_primary', label: 'Primary Button Label', type: 'text', placeholder: 'Explore Projects' },
      { key: 'cta_secondary', label: 'Secondary Button Label', type: 'text', placeholder: 'Join Our Club' },
    ],
  },
  {
    id: 'about',
    label: 'About & Vision',
    icon: Compass,
    fields: [
      { key: 'tagline', label: 'About Tagline', type: 'text', placeholder: 'Who We Are' },
      { key: 'heading', label: 'About Heading', type: 'text', placeholder: 'Building Tomorrow’s Leaders Today' },
      { key: 'description', label: 'About Story', type: 'textarea', rows: 4, placeholder: 'Chartered with a vision to unite passionate young minds...' },
      { key: 'vision', label: 'Vision Statement', type: 'textarea', rows: 3, placeholder: 'To foster visionary leaders who ignite sustainable community impact.' },
      { key: 'mission', label: 'Mission Statement', type: 'textarea', rows: 3, placeholder: 'Providing opportunities for young professionals and students to address community challenges.' },
    ],
  },
  {
    id: 'impact',
    label: 'Impact Numbers',
    icon: Layers,
    fields: [
      { key: 'stat_1_val', label: 'Metric 1 Value', type: 'text', placeholder: '50+' },
      { key: 'stat_1_lbl', label: 'Metric 1 Label', type: 'text', placeholder: 'Community Projects' },
      { key: 'stat_2_val', label: 'Metric 2 Value', type: 'text', placeholder: '15,000+' },
      { key: 'stat_2_lbl', label: 'Metric 2 Label', type: 'text', placeholder: 'Lives Impacted' },
      { key: 'stat_3_val', label: 'Metric 3 Value', type: 'text', placeholder: '100+' },
      { key: 'stat_3_lbl', label: 'Metric 3 Label', type: 'text', placeholder: 'Active Rotaractors' },
      { key: 'stat_4_val', label: 'Metric 4 Value', type: 'text', placeholder: '2,500+' },
      { key: 'stat_4_lbl', label: 'Metric 4 Label', type: 'text', placeholder: 'Volunteer Hours' },
    ],
  },
  {
    id: 'what_we_do',
    label: 'What We Do',
    icon: Layers,
    fields: [
      { key: 'heading', label: 'Section Heading', type: 'text', placeholder: 'Our Avenues of Service' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'From community development to professional growth and international service.' },
    ],
  },
  {
    id: 'join',
    label: 'Join Us CTA',
    icon: HeartHandshake,
    fields: [
      { key: 'heading', label: 'CTA Heading', type: 'text', placeholder: 'Ready to Make an Impact?' },
      { key: 'subtext', label: 'CTA Subtext', type: 'textarea', rows: 3, placeholder: 'Join the Rotaract Club of Lead India Ahead and become part of a global movement.' },
      { key: 'button_text', label: 'Button Text', type: 'text', placeholder: 'Apply for Membership' },
      { key: 'form_url', label: 'Google Form / Registration URL', type: 'text', placeholder: 'https://forms.gle/...' },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    icon: LayoutTemplate,
    fields: [
      { key: 'tagline', label: 'Footer Tagline', type: 'text', placeholder: 'Rotaract Club of Lead India Ahead • RID 3234' },
      { key: 'copyright', label: 'Copyright Notice', type: 'text', placeholder: '© 2024-2025 Rotaract Club of Lead India Ahead. All rights reserved.' },
    ],
  },
];

export const ContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SectionKey>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentValues, setContentValues] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const items = await adminGetAllContent();
      const grouped: Record<string, Record<string, string>> = {};
      for (const item of items) {
        if (!grouped[item.section]) grouped[item.section] = {};
        grouped[item.section][item.key] = item.value || '';
      }
      setContentValues(grouped);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load website content');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section: string, key: string, value: string) => {
    setContentValues((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value,
      },
    }));
  };

  const handleSaveCurrentSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const currentSectionConfig = SECTION_CONFIGS.find((s) => s.id === activeTab);
      if (!currentSectionConfig) return;

      const currentSectionData = contentValues[activeTab] || {};

      for (const field of currentSectionConfig.fields) {
        const val = currentSectionData[field.key] ?? '';
        await adminUpsertContent(activeTab, field.key, val);
      }

      showToast.success(`Saved ${currentSectionConfig.label} content`);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to save section content');
    } finally {
      setSaving(false);
    }
  };

  const currentSection = SECTION_CONFIGS.find((s) => s.id === activeTab)!;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <LayoutTemplate className="w-7 h-7 text-[#D7B65A]" />
            Homepage Content Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Customize headlines, taglines, impact statistics, and call-to-action messages
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Section Tabs */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Sections
          </span>
          <div className="glass-panel p-2 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-1">
            {SECTION_CONFIGS.map((section) => {
              const Icon = section.icon;
              const isActive = activeTab === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#D7B65A] text-[#07111F] shadow-sm'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Form */}
        <div className="md:col-span-3">
          <form onSubmit={handleSaveCurrentSection} className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <currentSection.icon className="w-5 h-5 text-[#D7B65A]" />
                  {currentSection.label} Content
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update text values for the {currentSection.label.toLowerCase()} on the public site
                </p>
              </div>

              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {saving ? <LoadingSpinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {currentSection.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      {field.label}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        rows={field.rows || 3}
                        value={contentValues[activeTab]?.[field.key] || ''}
                        onChange={(e) => handleChange(activeTab, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 transition-colors"
                      />
                    ) : (
                      <input
                        type="text"
                        value={contentValues[activeTab]?.[field.key] || ''}
                        onChange={(e) => handleChange(activeTab, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 transition-colors"
                      />
                    )}

                    {field.hint && (
                      <p className="text-[11px] text-slate-500 mt-1">{field.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
