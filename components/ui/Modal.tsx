'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
}: ModalProps) {
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

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop — warm tinted */}
      <div
        className="fixed inset-0 bg-[#1E2A32]/45 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container — squared, clean */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white border border-[#E2DDD6] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col my-8 max-h-[90vh] z-10 animate-fade-in-up`}
      >
        {/* Header — strong separator */}
        <div className="flex items-start justify-between px-5 py-4 border-b-2 border-[#E2DDD6]">
          <div>
            <h3 className="text-sm font-bold text-[#1E2A32] tracking-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[#6B7A87] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9AAAB6] hover:text-[#3D4E5C] hover:bg-[#F0EDE6] transition-colors rounded-[2px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 sm:px-6 sm:py-5 overflow-y-auto space-y-4 text-sm text-[#3D4E5C]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-[#E2DDD6] flex items-center justify-end gap-3 bg-[#F8F6F1]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
