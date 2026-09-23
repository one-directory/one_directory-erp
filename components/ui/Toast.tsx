'use client';

import React from 'react';
import { useERP } from '@/context/ERPContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useERP();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-60 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-4 h-4 text-[#2A6B55] shrink-0 mt-px" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#7A5C2E] shrink-0 mt-px" />,
          error: <AlertCircle className="w-4 h-4 text-[#8B3A3A] shrink-0 mt-px" />,
          info: <Info className="w-4 h-4 text-[#2E5E8E] shrink-0 mt-px" />,
        };

        // Left accent stripe by type
        const accentMap = {
          success: 'border-l-2 border-l-[#2A6B55]',
          warning: 'border-l-2 border-l-[#7A5C2E]',
          error: 'border-l-2 border-l-[#8B3A3A]',
          info: 'border-l-2 border-l-[#2E5E8E]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 bg-white border border-[#E2DDD6] shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-all animate-fade-in-up ${accentMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#1E2A32]">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-[#6B7A87] mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9AAAB6] hover:text-[#3D4E5C] p-0.5 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
