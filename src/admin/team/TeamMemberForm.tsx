import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Upload, User, Award, FileText, 
  Building, Droplet 
} from 'lucide-react';
import { adminGetTeamMember, adminCreateTeamMember, adminUpdateTeamMember } from '../../services/team';
import { uploadImage } from '../../services/storage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

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

export const TeamMemberForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingLetter, setUploadingLetter] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    bio: '',
    profile_image_url: '',
    letter_image_url: '',
    term: '2024-25',
    college_company: '',
    blood_group: '',
    is_executive: true,
    display_order: 0,
    published: true,
    instagram_url: '',
    linkedin_url: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadMember(id);
    }
  }, [id, isEdit]);

  const loadMember = async (memberId: string) => {
    setLoading(true);
    try {
      const member = await adminGetTeamMember(memberId);
      if (member) {
        setFormData({
          name: member.name,
          designation: member.designation,
          bio: member.bio || '',
          profile_image_url: member.profile_image_url || '',
          letter_image_url: member.letter_image_url || '',
          term: member.term || '2024-25',
          college_company: member.college_company || '',
          blood_group: member.blood_group || '',
          is_executive: member.is_executive,
          display_order: member.display_order || 0,
          published: member.published,
          instagram_url: member.instagram_url || '',
          linkedin_url: member.linkedin_url || '',
        });
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load team member');
      navigate('/admin/team');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfile(true);
    try {
      const result = await uploadImage('team-images', id || 'profiles', file);
      setFormData((prev) => ({ ...prev, profile_image_url: result.url }));
      showToast.success('Profile photo uploaded');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleLetterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLetter(true);
    try {
      const result = await uploadImage('team-images', id || 'letters', file);
      setFormData((prev) => ({ ...prev, letter_image_url: result.url }));
      showToast.success('Appointment letter uploaded');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to upload letter');
    } finally {
      setUploadingLetter(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast.error('Please enter the member name');
      return;
    }
    if (!formData.designation.trim()) {
      showToast.error('Please enter the designation');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        bio: formData.bio.trim() || null,
        profile_image_url: formData.profile_image_url.trim() || null,
        letter_image_url: formData.letter_image_url.trim() || null,
        term: formData.term.trim() || '2024-25',
        college_company: formData.college_company.trim() || null,
        blood_group: formData.blood_group.trim() || null,
        is_executive: formData.is_executive,
        display_order: Number(formData.display_order) || 0,
        published: formData.published,
        instagram_url: formData.instagram_url.trim() || null,
        linkedin_url: formData.linkedin_url.trim() || null,
      };

      if (isEdit && id) {
        await adminUpdateTeamMember(id, payload);
        showToast.success('Team member updated successfully');
      } else {
        await adminCreateTeamMember(payload as any);
        showToast.success('Team member added successfully');
      }
      navigate('/admin/team');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to save team member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 text-sm mt-3">Loading member details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/team"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEdit ? 'Edit Team Member' : 'Add Team Member'}
            </h1>
            <p className="text-sm text-slate-400">
              {isEdit ? 'Update leadership role, bio, and social links' : 'Add a club leader or board member'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/team"
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
            {isEdit ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Photos (1 col) */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4 text-center">
            <h2 className="text-sm font-semibold text-white">Profile Photo</h2>

            <div className="mx-auto w-32 h-32 rounded-2xl overflow-hidden border border-white/10 bg-[#07111F]/80 flex items-center justify-center relative group">
              {formData.profile_image_url ? (
                <img
                  src={formData.profile_image_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-slate-500" />
              )}
            </div>

            <div>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{formData.profile_image_url ? 'Change Photo' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfileUpload}
                  disabled={uploadingProfile}
                  className="sr-only"
                />
              </label>
              {uploadingProfile && (
                <div className="mt-2 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>

            <div>
              <input
                type="url"
                value={formData.profile_image_url}
                onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                placeholder="Or paste image URL"
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60 text-center"
              />
            </div>
          </div>

          {/* Appointment Letter Photo */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4 text-center">
            <h2 className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
              <FileText className="w-4 h-4 text-[#D7B65A]" />
              Appointment Letter
            </h2>

            {formData.letter_image_url ? (
              <div className="space-y-2">
                <div className="rounded-xl overflow-hidden border border-white/10 aspect-[3/4]">
                  <img
                    src={formData.letter_image_url}
                    alt="Appointment letter"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, letter_image_url: '' })}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Remove Letter
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-white/20 rounded-xl p-4 text-center space-y-2">
                <label className="text-xs font-semibold text-[#D7B65A] hover:underline cursor-pointer block">
                  <span>Upload letter image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLetterUpload}
                    disabled={uploadingLetter}
                    className="sr-only"
                  />
                </label>
                <p className="text-[10px] text-slate-500">Official club letter document</p>
                {uploadingLetter && <LoadingSpinner size="sm" />}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Information & Roles (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D7B65A]" />
              Personal & Role Details
            </h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rtr. Santhosh Kumar"
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>

            {/* Designation & Term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Designation <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. President, Secretary, Director"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Rotary Term
                </label>
                <input
                  type="text"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  placeholder="e.g. 2024-25"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>

            {/* College / Company & Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  College / Workplace
                </label>
                <input
                  type="text"
                  value={formData.college_company}
                  onChange={(e) => setFormData({ ...formData, college_company: e.target.value })}
                  placeholder="e.g. Sri Sairam Institute of Technology"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-400" />
                  Blood Group
                </label>
                <input
                  type="text"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  placeholder="e.g. O+, B+, A+"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Bio / Vision Statement
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Short leadership message or background..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <LinkedinIcon className="w-3.5 h-3.5 text-sky-400" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                  Instagram Profile
                </label>
                <input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>

            {/* Display Order & Toggles */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4 sm:pt-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_executive}
                    onChange={(e) => setFormData({ ...formData, is_executive: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-[#D7B65A] focus:ring-0 bg-[#07111F]"
                  />
                  <span className="text-xs text-white font-medium">Executive Board</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-[#D7B65A] focus:ring-0 bg-[#07111F]"
                  />
                  <span className="text-xs text-white font-medium">Visible on Website</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
