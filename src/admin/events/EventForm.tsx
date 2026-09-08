import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminGetEvent, adminCreateEvent, adminUpdateEvent,
} from '../../services/events';
import type { Event } from '../../types/supabase';
import { EventGalleryManager } from './EventGalleryManager';

const EVENT_CATEGORIES = [
  'Community Service', 'Leadership', 'Sports', 'Health', 'Education',
  'Environment', 'Fellowship', 'Professional Development', 'Women Empowerment',
  'District Event', 'Other',
];

const LIA_ROLES = [
  { value: 'Organizer', label: 'Organizer — LIA is primary organizer' },
  { value: 'Co-Organizer', label: 'Co-Organizer — Joint organization' },
  { value: 'Collaborator', label: 'Collaborator — LIA collaborated' },
  { value: 'Participant', label: 'Participant — LIA members attended' },
  { value: 'Partner', label: 'Partner — Strategic partner' },
];

const EVENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

type EventFormData = {
  title: string;
  subtitle: string;
  slug: string;
  description: string;
  short_description: string;
  event_date: string;
  display_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  city: string;
  category: string;
  organizer: string;
  organizer_type: string;
  lia_role: string;
  collaborators_raw: string;
  tags_raw: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  cover_image_url: string;
  external_url: string;
  instagram_url: string;
  linkedin_url: string;
  source_platform: string;
  source_url: string;
  source_verified: boolean;
  year: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function eventToFormData(event: Event): EventFormData {
  return {
    title: event.title,
    subtitle: event.subtitle ?? '',
    slug: event.slug,
    description: event.description ?? '',
    short_description: event.short_description ?? '',
    event_date: event.event_date ?? '',
    display_date: event.display_date ?? '',
    start_time: event.start_time ?? '',
    end_time: event.end_time ?? '',
    venue: event.venue ?? '',
    city: event.city ?? 'Coimbatore',
    category: event.category,
    organizer: event.organizer ?? '',
    organizer_type: event.organizer_type,
    lia_role: event.lia_role,
    collaborators_raw: event.collaborators.join('\n'),
    tags_raw: event.tags.join(', '),
    status: event.status,
    featured: event.featured,
    cover_image_url: event.cover_image_url ?? '',
    external_url: event.external_url ?? '',
    instagram_url: event.instagram_url ?? '',
    linkedin_url: event.linkedin_url ?? '',
    source_platform: event.source_platform ?? '',
    source_url: event.source_url ?? '',
    source_verified: event.source_verified,
    year: event.year?.toString() ?? '',
  };
}

const defaultForm: EventFormData = {
  title: '', subtitle: '', slug: '', description: '', short_description: '',
  event_date: '', display_date: '', start_time: '', end_time: '',
  venue: '', city: 'Coimbatore', category: 'Community Service',
  organizer: '', organizer_type: 'LIA', lia_role: 'Organizer',
  collaborators_raw: '', tags_raw: '', status: 'draft', featured: false,
  cover_image_url: '', external_url: '', instagram_url: '', linkedin_url: '',
  source_platform: '', source_url: '', source_verified: false, year: '',
};

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}
function FormField({ label, required, children, hint }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-colors
  bg-white/5 border border-white/10 outline-none focus:border-[#D7B65A]/50 focus:bg-white/7`;

export function EventForm() {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const navigate = useNavigate();

  const [form, setForm] = useState<EventFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [savedEventId, setSavedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'gallery'>('details');

  useEffect(() => {
    if (!isNew && id) {
      adminGetEvent(id)
        .then((event) => {
          if (event) {
            setForm(eventToFormData(event));
            setSavedEventId(event.id);
          } else {
            toast.error('Event not found.');
            navigate('/admin/events');
          }
        })
        .catch(() => {
          toast.error('Failed to load event.');
          navigate('/admin/events');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew, navigate]);

  const set = useCallback((field: keyof EventFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isNew ? slugify(title) : prev.slug,
      year: isNew && prev.event_date
        ? prev.year
        : prev.year,
    }));
  };

  const handleDateChange = (date: string) => {
    setForm((prev) => ({
      ...prev,
      event_date: date,
      year: date ? new Date(date).getFullYear().toString() : prev.year,
    }));
  };

  const buildPayload = (): Omit<Event, 'id' | 'created_at' | 'updated_at'> => ({
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || null,
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    short_description: form.short_description.trim() || null,
    event_date: form.event_date || null,
    display_date: form.display_date.trim() || null,
    start_time: form.start_time || null,
    end_time: form.end_time || null,
    venue: form.venue.trim() || null,
    city: form.city.trim() || null,
    category: form.category,
    organizer: form.organizer.trim() || null,
    organizer_type: form.organizer_type,
    lia_role: form.lia_role,
    collaborators: form.collaborators_raw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    tags: form.tags_raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    status: form.status,
    featured: form.featured,
    cover_image_url: form.cover_image_url.trim() || null,
    external_url: form.external_url.trim() || null,
    instagram_url: form.instagram_url.trim() || null,
    linkedin_url: form.linkedin_url.trim() || null,
    source_platform: form.source_platform.trim() || null,
    source_url: form.source_url.trim() || null,
    source_verified: form.source_verified,
    year: form.year ? parseInt(form.year) : null,
    created_by: null,
    updated_by: null,
  });

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Event title is required.'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required.'); return; }
    setSaving(true);
    try {
      if (isNew) {
        const created = await adminCreateEvent(buildPayload());
        setSavedEventId(created.id);
        toast.success('Event created successfully.');
        navigate(`/admin/events/${created.id}/edit`, { replace: true });
      } else if (id) {
        await adminUpdateEvent(id, buildPayload());
        toast.success('Event saved.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#D7B65A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/events')}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/8 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-100">
            {isNew ? 'New Event' : 'Edit Event'}
          </h1>
          {!isNew && <p className="text-sm text-slate-500">{form.title}</p>}
        </div>
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #D7B65A 0%, #B89635 100%)',
            color: '#07111F',
          }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Event'}
        </button>
      </div>

      {/* Tabs (only show Gallery tab when editing an existing event) */}
      {!isNew && (
        <div className="flex border-b border-white/10 gap-1">
          {(['details', 'gallery'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-[#D7B65A] text-[#D7B65A]'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'gallery' ? 'Event Gallery' : 'Event Details'}
            </button>
          ))}
        </div>
      )}

      {/* Tab: Details */}
      {activeTab === 'details' && (
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: 'rgba(14, 27, 48, 0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <FormField label="Event Title" required>
                <input
                  className={inputCls}
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="THE ONE — 13th Installation Ceremony"
                />
              </FormField>
            </div>

            <FormField label="Subtitle">
              <input
                className={inputCls}
                value={form.subtitle}
                onChange={(e) => set('subtitle', e.target.value)}
                placeholder="Optional subtitle"
              />
            </FormField>

            <FormField label="URL Slug" required hint="Auto-generated from title. Must be unique.">
              <input
                className={inputCls}
                value={form.slug}
                onChange={(e) => set('slug', slugify(e.target.value))}
                placeholder="the-one-installation"
              />
            </FormField>

            <FormField label="Event Date">
              <input type="date" className={inputCls} value={form.event_date} onChange={(e) => handleDateChange(e.target.value)} />
            </FormField>

            <FormField label="Display Date" hint="Human-readable date shown on cards (e.g. '18 July 2026')">
              <input className={inputCls} value={form.display_date} onChange={(e) => set('display_date', e.target.value)} placeholder="18 July 2026" />
            </FormField>

            <FormField label="Start Time">
              <input type="time" className={inputCls} value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
            </FormField>

            <FormField label="End Time">
              <input type="time" className={inputCls} value={form.end_time} onChange={(e) => set('end_time', e.target.value)} />
            </FormField>

            <FormField label="Venue">
              <input className={inputCls} value={form.venue} onChange={(e) => set('venue', e.target.value)} placeholder="Texcity Hall" />
            </FormField>

            <FormField label="City">
              <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Coimbatore" />
            </FormField>

            <FormField label="Category" required>
              <select className={inputCls + ' cursor-pointer'} value={form.category} onChange={(e) => set('category', e.target.value)}>
                {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>

            <FormField label="LIA's Role in this Event" required hint="Important: Do NOT label district events as LIA-organized.">
              <select className={inputCls + ' cursor-pointer'} value={form.lia_role} onChange={(e) => set('lia_role', e.target.value)}>
                {LIA_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </FormField>

            <FormField label="Organizer Name">
              <input className={inputCls} value={form.organizer} onChange={(e) => set('organizer', e.target.value)} placeholder="Rotaract Club of Lead India Ahead" />
            </FormField>

            <FormField label="Status" required>
              <select className={inputCls + ' cursor-pointer'} value={form.status} onChange={(e) => set('status', e.target.value as 'draft' | 'published' | 'archived')}>
                {EVENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Short Description" hint="Shown on event cards (2–3 sentences)">
                <textarea className={inputCls + ' resize-none'} rows={2} value={form.short_description} onChange={(e) => set('short_description', e.target.value)} placeholder="Brief summary for event cards…" />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Full Description">
                <textarea className={inputCls + ' resize-none'} rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Detailed event description…" />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Collaborators" hint="One collaborator per line">
                <textarea className={inputCls + ' resize-none'} rows={3} value={form.collaborators_raw} onChange={(e) => set('collaborators_raw', e.target.value)} placeholder="Rotary Club of Coimbatore Texcity&#10;Coimbatore Eagles" />
              </FormField>
            </div>

            <FormField label="Tags" hint="Comma-separated">
              <input className={inputCls} value={form.tags_raw} onChange={(e) => set('tags_raw', e.target.value)} placeholder="Sports, Youth, Community Service" />
            </FormField>

            <FormField label="Cover Image URL" hint="Will be overridden by gallery cover if set">
              <input className={inputCls} value={form.cover_image_url} onChange={(e) => set('cover_image_url', e.target.value)} placeholder="/assets/events/the-one.jpg" />
            </FormField>

            <FormField label="Instagram URL">
              <input className={inputCls} value={form.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} placeholder="https://www.instagram.com/…" />
            </FormField>

            <FormField label="LinkedIn URL">
              <input className={inputCls} value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://www.linkedin.com/…" />
            </FormField>

            <FormField label="External URL">
              <input className={inputCls} value={form.external_url} onChange={(e) => set('external_url', e.target.value)} placeholder="https://…" />
            </FormField>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="w-4 h-4 accent-[#D7B65A]"
              />
              <label htmlFor="featured" className="text-sm text-slate-300">Featured event (shown prominently)</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="source_verified"
                checked={form.source_verified}
                onChange={(e) => set('source_verified', e.target.checked)}
                className="w-4 h-4 accent-[#D7B65A]"
              />
              <label htmlFor="source_verified" className="text-sm text-slate-300">Source verified</label>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Gallery */}
      {activeTab === 'gallery' && (savedEventId || id) && (
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(14, 27, 48, 0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <EventGalleryManager eventId={savedEventId ?? id!} />
        </div>
      )}

      {activeTab === 'gallery' && isNew && !savedEventId && (
        <div className="text-center py-12 text-slate-500 text-sm">
          Save the event details first to unlock gallery management.
        </div>
      )}

      {/* Save Footer */}
      <div className="flex justify-end gap-3">
        <button onClick={() => navigate('/admin/events')} className="px-5 py-2.5 text-sm text-slate-300 hover:text-slate-100 border border-white/10 hover:border-white/20 rounded-xl transition-colors">
          Cancel
        </button>
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #D7B65A 0%, #B89635 100%)', color: '#07111F' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Event'}
        </button>
      </div>
    </div>
  );
}
