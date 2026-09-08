import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage, validateImageFile, type StorageBucket } from '../../services/storage';

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  url?: string;
  storagePath?: string;
}

interface EventImageUploaderProps {
  bucket: StorageBucket;
  entityId: string;
  onUploaded: (url: string, storagePath: string, file: File) => void;
  maxFiles?: number;
}

export function EventImageUploader({
  bucket,
  entityId,
  onUploaded,
  maxFiles = 20,
}: EventImageUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);

  const updateItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((it) => it.id !== id);
    });
  };

  const processFiles = useCallback(
    async (files: File[]) => {
      const newItems: UploadItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
      }));

      setItems((prev) => [...prev, ...newItems]);

      for (const item of newItems) {
        const validationError = validateImageFile(item.file);
        if (validationError) {
          updateItem(item.id, { status: 'error', error: validationError });
          continue;
        }

        updateItem(item.id, { status: 'uploading' });

        try {
          const result = await uploadImage(bucket, entityId, item.file);
          updateItem(item.id, {
            status: 'done',
            url: result.url,
            storagePath: result.storagePath,
          });
          onUploaded(result.url, result.storagePath, item.file);
        } catch (err) {
          updateItem(item.id, {
            status: 'error',
            error: err instanceof Error ? err.message : 'Upload failed',
          });
        }
      }
    },
    [bucket, entityId, onUploaded]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = maxFiles - items.length;
      processFiles(acceptedFiles.slice(0, remaining));
    },
    [items.length, maxFiles, processFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/jpg': [], 'image/png': [], 'image/webp': [] },
    maxFiles,
    noClick: false,
  });

  const pendingCount = items.filter((i) => i.status === 'uploading').length;
  const doneCount = items.filter((i) => i.status === 'done').length;
  const errorCount = items.filter((i) => i.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-[#D7B65A] bg-[#D7B65A]/5'
            : 'border-white/15 hover:border-white/30 hover:bg-white/3'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        {isDragActive ? (
          <p className="text-[#D7B65A] font-medium">Drop images here…</p>
        ) : (
          <>
            <p className="text-slate-300 font-medium mb-1">Drag & drop images here</p>
            <p className="text-slate-500 text-sm">or click to browse — JPG, PNG, WEBP · max 10 MB each</p>
          </>
        )}
      </div>

      {/* Status Summary */}
      {items.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {pendingCount} uploading
            </span>
          )}
          {doneCount > 0 && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" /> {doneCount} uploaded
            </span>
          )}
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-3.5 h-3.5" /> {errorCount} failed
            </span>
          )}
          <button
            onClick={() => setItems([])}
            className="ml-auto text-slate-600 hover:text-slate-400 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Thumbnails Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <div
                className="aspect-square rounded-xl overflow-hidden relative"
                style={{
                  border: `1px solid ${
                    item.status === 'done'
                      ? 'rgba(52,211,153,0.3)'
                      : item.status === 'error'
                      ? 'rgba(248,113,113,0.3)'
                      : item.status === 'uploading'
                      ? 'rgba(215,182,90,0.3)'
                      : 'rgba(255,255,255,0.1)'
                  }`,
                }}
              >
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay for status */}
                {item.status !== 'done' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    {item.status === 'uploading' && (
                      <Loader2 className="w-6 h-6 text-[#D7B65A] animate-spin" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    )}
                    {item.status === 'pending' && (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>

                {/* Done indicator */}
                {item.status === 'done' && (
                  <div className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Filename & size */}
              <div className="mt-1.5 px-0.5">
                <p className="text-xs text-slate-400 truncate">{item.file.name}</p>
                <p className="text-xs text-slate-600">
                  {(item.file.size / 1024).toFixed(0)} KB
                </p>
                {item.status === 'error' && (
                  <p className="text-xs text-red-400 mt-0.5 leading-tight">{item.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
