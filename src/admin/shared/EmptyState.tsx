import React from 'react';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, action, actionLabel, onAction }: EmptyStateProps) {
  const finalAction = action || (actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined);

  const renderIcon = () => {
    if (!icon) return <PlusCircle className="w-8 h-8" />;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function') {
      const IconComp = icon as React.ComponentType<{ className?: string }>;
      return <IconComp className="w-8 h-8" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-[#D7B65A]">
        {renderIcon()}
      </div>
      <h3 className="text-slate-300 font-medium text-base mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-xs mb-6">{description}</p>
      )}
      {finalAction && (
        <button
          type="button"
          onClick={finalAction.onClick}
          className="px-5 py-2.5 bg-[#D7B65A] hover:bg-[#E8C96A] text-[#07111F] font-medium text-sm rounded-xl transition-colors cursor-pointer"
        >
          {finalAction.label}
        </button>
      )}
    </div>
  );
}
