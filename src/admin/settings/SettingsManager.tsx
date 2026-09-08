import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Mail, Phone, MapPin, Globe, Shield 
} from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

import { adminGetAllSettings, adminUpsertSetting } from '../../services/content';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

export const SettingsManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<Record<string, string>>({
    // These defaults match 002_seed_data.sql and are only shown briefly before Supabase responds.
    // They are overwritten once settings load from the database.
    club_name: 'Rotaract Club of Lead India Ahead',
    short_name: 'LIA',
    established: '2012',
    district: 'Rotaract District 3206',
    club_id: '90062',
    rotary_year: '2026–27',
    current_theme: 'MAAYON',
    president_name: 'Rtr. Hariharan B',
    president_title: 'President',
    president_term: '2026–27',
    location: 'Coimbatore, Tamil Nadu, India',
    sponsor_club: 'Rotary Club of Coimbatore Texcity',
    email: 'racleadindiaahead2021@gmail.com',
    phone_primary: '+91 63697 98451',
    phone_secondary: '+91 75027 97780',
    instagram_handle: '@rotaract.clubof.lia',
    instagram_url: 'https://www.instagram.com/rotaract.clubof.lia/',
    linkedin_url: 'https://www.linkedin.com/company/rotaract-club-of-lead-india-ahead/',
    address: 'Coimbatore, Tamil Nadu, India',
    seo_title: 'Rotaract Club of Lead India Ahead | MAAYON 2026–27',
    seo_description: 'Official website of the Rotaract Club of Lead India Ahead (LIA), Rotaract District 3206, Coimbatore. Presidential theme: MAAYON 2026–27.',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const items = await adminGetAllSettings();
      const mapped: Record<string, string> = { ...settings };
      for (const item of items) {
        if (item.value !== null) {
          mapped[item.key] = item.value;
        }
      }
      setSettings(mapped);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await adminUpsertSetting(key, value);
      }
      showToast.success('Global site settings updated successfully');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 text-sm mt-3">Loading settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-[#D7B65A]" />
            Site Settings & Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage global club metadata, official contact details, social URLs, and SEO
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 shadow-lg shadow-[#D7B65A]/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
          Save All Settings
        </button>
      </div>

      {/* 1. Club Identity */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#D7B65A]" />
          Club & Leadership Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Club Name
            </label>
            <input
              type="text"
              value={settings.club_name}
              onChange={(e) => handleFieldChange('club_name', e.target.value)}
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Rotary District
            </label>
            <input
              type="text"
              value={settings.district ?? ''}
              onChange={(e) => handleFieldChange('district', e.target.value)}
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Current Rotary Year
            </label>
            <input
              type="text"
              value={settings.rotary_year}
              onChange={(e) => handleFieldChange('rotary_year', e.target.value)}
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              President Name
            </label>
            <input
              type="text"
              value={settings.president_name}
              onChange={(e) => handleFieldChange('president_name', e.target.value)}
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact Information */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#D7B65A]" />
          Official Contact Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Official Email
            </label>
            <input
              type="email"
              value={settings.email ?? ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Primary Phone / WhatsApp
            </label>
            <input
              type="text"
              value={settings.phone_primary ?? ''}
              onChange={(e) => handleFieldChange('phone_primary', e.target.value)}
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Secondary Phone
            </label>
            <input
              type="text"
              value={settings.phone_secondary ?? ''}
              onChange={(e) => handleFieldChange('phone_secondary', e.target.value)}
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Address / City
            </label>
            <input
              type="text"
              value={settings.address ?? ''}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>
        </div>
      </div>

      {/* 3. Social Media Links */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#D7B65A]" />
          Official Social Media Channels
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
              Instagram Page URL
            </label>
            <input
              type="url"
              value={settings.instagram_url ?? ''}
              onChange={(e) => handleFieldChange('instagram_url', e.target.value)}
              placeholder="https://www.instagram.com/rotaract.clubof.lia/"
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
              Instagram Handle (@)
            </label>
            <input
              type="text"
              value={settings.instagram_handle ?? ''}
              onChange={(e) => handleFieldChange('instagram_handle', e.target.value)}
              placeholder="@rotaract.clubof.lia"
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <LinkedinIcon className="w-3.5 h-3.5 text-sky-400" />
              LinkedIn Page URL
            </label>
            <input
              type="url"
              value={settings.linkedin_url ?? ''}
              onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
              placeholder="https://www.linkedin.com/company/rotaract-club-of-lead-india-ahead/"
              className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
            />
          </div>
        </div>
      </div>

      {/* 4. SEO Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#D7B65A]" />
          Search Engine Optimization (SEO)
        </h2>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Default Page Title
          </label>
          <input
            type="text"
            value={settings.seo_title}
            onChange={(e) => handleFieldChange('seo_title', e.target.value)}
            className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Meta Description
          </label>
          <textarea
            rows={3}
            value={settings.seo_description}
            onChange={(e) => handleFieldChange('seo_description', e.target.value)}
            className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
          />
        </div>
      </div>
    </form>
  );
};
