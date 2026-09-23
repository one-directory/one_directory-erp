'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  width = 'lg',
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E2A32]/38 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          className={`w-screen ${widthStyles[width]} bg-white border-l-2 border-[#1C2B35]/30 shadow-[-8px_0_32px_rgba(0,0,0,0.1)] flex flex-col animate-slide-in-right`}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E2DDD6] bg-[#F8F6F1] flex items-start justify-between gap-3 shrink-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-sm font-bold text-[#1E2A32] tracking-tight">{title}</h2>
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-[#6B7A87] mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#9AAAB6] hover:text-[#3D4E5C] hover:bg-[#E8E3DA] transition-colors rounded-[2px] shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 px-5 py-5 overflow-y-auto space-y-5 text-sm text-[#3D4E5C]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-5 py-4 border-t border-[#E2DDD6] bg-[#F8F6F1] flex items-center justify-end gap-3 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
