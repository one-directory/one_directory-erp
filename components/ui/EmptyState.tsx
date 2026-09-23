import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[#F8F6F1] border border-dashed border-[#CEC9C1] ${className}`}
    >
      {/* Icon — no box, just the icon in muted color */}
      <span className="text-[#9AAAB6] mb-4 block">{icon}</span>
      <h3 className="text-sm font-bold text-[#1E2A32] tracking-tight">{title}</h3>
      <p className="text-xs text-[#6B7A87] max-w-sm mt-1 mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
