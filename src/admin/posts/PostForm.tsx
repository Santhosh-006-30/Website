import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  ArrowLeft, Save, Upload, FileText, 
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo, Redo, Minus, Link as LinkIcon
} from 'lucide-react';
import { adminGetPost, adminCreatePost, adminUpdatePost } from '../../services/posts';
import { uploadImage } from '../../services/storage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

export const PostForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: 'Club News',
    author: 'Rotaract Club of Lead India Ahead',
    publish_date: new Date().toISOString().split('T')[0],
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    cover_image_url: '',
    instagram_url: '',
    linkedin_url: '',
  });

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
        placeholder: 'Write the post content here...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none text-slate-200 min-h-[260px] p-4 focus:outline-none text-sm leading-relaxed',
      },
    },
  });

  const loadPost = useCallback(async (postId: string) => {
    setLoading(true);
    try {
      const post = await adminGetPost(postId);
      if (post) {
        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          category: post.category || 'Club News',
          author: post.author || 'Rotaract Club of Lead India Ahead',
          publish_date: post.publish_date || new Date().toISOString().split('T')[0],
          status: post.status,
          featured: post.featured,
          cover_image_url: post.cover_image_url || '',
          instagram_url: post.instagram_url || '',
          linkedin_url: post.linkedin_url || '',
        });
        if (editor && post.content) {
          editor.commands.setContent(post.content);
        }
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to load post');
      navigate('/admin/posts');
    } finally {
      setLoading(false);
    }
  }, [editor, navigate]);

  useEffect(() => {
    if (isEdit && id) {
      void loadPost(id);
    }
  }, [id, isEdit, loadPost]);

  // Sync editor content when editor becomes ready if editing
  useEffect(() => {
    if (editor && isEdit && id && !loading) {
      adminGetPost(id).then((post) => {
        if (post?.content && editor.isEmpty) {
          editor.commands.setContent(post.content);
        }
      });
    }
  }, [editor, isEdit, id, loading]);

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
      const result = await uploadImage('gallery-images', id || 'post-covers', file);
      setFormData((prev) => ({ ...prev, cover_image_url: result.url }));
      showToast.success('Cover image uploaded successfully');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to upload cover image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast.error('Please enter a post title');
      return;
    }
    if (!formData.slug.trim()) {
      showToast.error('Please enter a valid slug');
      return;
    }

    const htmlContent = editor?.getHTML() || '';

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase(),
        excerpt: formData.excerpt.trim() || null,
        content: htmlContent,
        category: formData.category,
        author: formData.author.trim() || 'Rotaract Club of Lead India Ahead',
        publish_date: formData.publish_date || null,
        status: formData.status,
        featured: formData.featured,
        cover_image_url: formData.cover_image_url.trim() || null,
        instagram_url: formData.instagram_url.trim() || null,
        linkedin_url: formData.linkedin_url.trim() || null,
      };

      if (isEdit && id) {
        await adminUpdatePost(id, payload);
        showToast.success('Post updated successfully');
      } else {
        await adminCreatePost(payload as any);
        showToast.success('Post created successfully');
      }
      navigate('/admin/posts');
    } catch (err: any) {
      showToast.error(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 text-sm mt-3">Loading post details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/posts"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEdit ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-sm text-slate-400">
              {isEdit ? 'Update post content, status, and metadata' : 'Publish an article, announcement, or story'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/posts"
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
            {isEdit ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Essentials */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D7B65A]" />
              Article Information
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Lead India Ahead Receives District Excellence Citation"
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
                  /posts/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-slug-url"
                  className="w-full bg-[#07111F]/80 border border-white/10 rounded-r-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Summary / Excerpt
              </label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary that appears on post cards and search previews..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>
          </div>

          {/* Tiptap Rich Text Editor */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Post Content
            </label>

            {/* Toolbar */}
            {editor && (
              <div className="flex flex-wrap items-center gap-1 p-2 bg-[#07111F]/90 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('bold') ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('italic') ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('underline') ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Underline"
                >
                  <UnderlineIcon className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-white/10 mx-1" />

                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('heading', { level: 1 }) ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('heading', { level: 2 }) ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('heading', { level: 3 }) ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-white/10 mx-1" />

                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('bulletList') ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('orderedList') ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('blockquote') ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-white/10 mx-1" />

                <button
                  type="button"
                  onClick={setLink}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    editor.isActive('link') ? 'bg-[#D7B65A] text-[#07111F]' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Add Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                  className="p-1.5 text-slate-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Horizontal Line"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-white/10 mx-1 ml-auto" />

                <button
                  type="button"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="p-1.5 text-slate-300 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="p-1.5 text-slate-300 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Editor Box */}
            <div className="border border-white/10 rounded-xl bg-[#07111F]/80 focus-within:border-[#D7B65A]/60 min-h-[300px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Sidebar Column (1 col) */}
        <div className="space-y-6">
          {/* Status & Publishing */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white">Publishing Settings</h2>

            {/* Status */}
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

            {/* Publish Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Publish Date
              </label>
              <input
                type="date"
                value={formData.publish_date}
                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Club News, Awards, District"
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>

            {/* Featured toggle */}
            <div className="pt-2 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 text-[#D7B65A] focus:ring-0 bg-[#07111F]"
                />
                <span className="text-sm text-white font-medium">Feature on Homepage</span>
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white">Cover Image</h2>

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

          {/* Social Links */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0c192e]/60 space-y-4">
            <h2 className="text-base font-semibold text-white">Social Links</h2>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/p/..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/posts/..."
                className="w-full bg-[#07111F]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
