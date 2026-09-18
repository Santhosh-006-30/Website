import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  confirmVariant,
  loading = false,
  isLoading,
}: ConfirmDialogProps) {
  const isDanger = confirmVariant ? confirmVariant === 'danger' : danger;
  const isBusy = isLoading !== undefined ? isLoading : loading;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isBusy) onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isBusy, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: 'rgba(10, 20, 38, 0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex gap-4 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
              isDanger ? 'bg-red-500/15' : 'bg-amber-500/15'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${isDanger ? 'text-red-400' : 'text-amber-400'}`}
            />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="text-slate-100 font-semibold text-base mb-1">{title}</h3>
            <p id="confirm-dialog-message" className="text-slate-400 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="px-4 py-2 text-sm text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-[#D7B65A] hover:bg-[#E8C96A] text-[#07111F]'
            }`}
          >
            {isBusy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
