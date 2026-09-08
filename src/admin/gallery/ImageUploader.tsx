import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadImage, validateImageFile } from '../../services/storage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { showToast } from '../shared/Toast';

interface FileUploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  uploadedUrl?: string;
  storagePath?: string;
}

interface ImageUploaderProps {
  entityId: string;
  onUploadSuccess: (results: Array<{ image_url: string; storage_path: string; caption: string }>) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  entityId,
  onUploadSuccess,
}) => {
  const [queue, setQueue] = useState<FileUploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: FileUploadQueueItem[] = [];

    for (const file of acceptedFiles) {
      const error = validateImageFile(file);
      if (error) {
        showToast.error(`${file.name}: ${error}`);
        continue;
      }
      newItems.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        status: 'pending',
      });
    }

    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  const removeFromQueue = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateCaption = (id: string, caption: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption } : item))
    );
  };

  const handleUploadAll = async () => {
    const pendingItems = queue.filter((item) => item.status === 'pending');
    if (pendingItems.length === 0) return;

    setIsUploading(true);
    const successfulUploads: Array<{ image_url: string; storage_path: string; caption: string }> = [];

    for (const item of pendingItems) {
      // Mark as uploading
      setQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i))
      );

      try {
        const result = await uploadImage('gallery-images', entityId || 'general', item.file);
        
        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'success',
                  uploadedUrl: result.url,
                  storagePath: result.storagePath,
                }
              : i
          )
        );

        successfulUploads.push({
          image_url: result.url,
          storage_path: result.storagePath,
          caption: item.caption,
        });
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', errorMessage: err.message || 'Upload failed' }
              : i
          )
        );
      }
    }

    setIsUploading(false);

    if (successfulUploads.length > 0) {
      onUploadSuccess(successfulUploads);
      showToast.success(`Successfully uploaded ${successfulUploads.length} photo${successfulUploads.length > 1 ? 's' : ''}`);
      // Remove successful from queue after a short delay
      setTimeout(() => {
        setQueue((prev) => prev.filter((i) => i.status !== 'success'));
      }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-[#D7B65A] bg-[#D7B65A]/10 scale-[1.01]'
            : 'border-white/15 bg-[#07111F]/50 hover:border-[#D7B65A]/50 hover:bg-[#07111F]/70'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#D7B65A] mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-white">
          {isDragActive ? 'Drop images here...' : 'Click or drag photos to upload'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports JPG, PNG, WEBP (up to 10MB per photo)
        </p>
      </div>

      {/* Upload Queue */}
      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected Files ({queue.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQueue([])}
                disabled={isUploading}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={isUploading || queue.every((i) => i.status !== 'pending')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#D7B65A] to-[#B3933B] text-[#07111F] hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Upload All ({queue.filter((i) => i.status === 'pending').length})
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex gap-3 relative group"
              >
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-white/10"
                />

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-white truncate">
                      {item.file.name}
                    </span>
                    {item.status === 'success' && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    {item.status === 'uploading' && <LoadingSpinner size="sm" />}
                    {item.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => removeFromQueue(item.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => updateCaption(item.id, e.target.value)}
                    placeholder="Photo caption..."
                    disabled={item.status !== 'pending'}
                    className="w-full bg-[#07111F]/80 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-[#D7B65A]/60"
                  />

                  {item.errorMessage && (
                    <p className="text-[10px] text-rose-400 truncate">{item.errorMessage}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
