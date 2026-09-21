'use client';

import React from 'react';
import { ShieldOff, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_INFO_MAP, ROLE_MODULE_PERMISSIONS } from '@/lib/rbac';
import { NavigationModule } from '@/components/shell/Sidebar';

interface AccessDeniedViewProps {
  module: NavigationModule;
  onBack: () => void;
}

export function AccessDeniedView({ module, onBack }: AccessDeniedViewProps) {
  const { user } = useAuth();

  const roleThatCanAccess = (Object.keys(ROLE_MODULE_PERMISSIONS) as (keyof typeof ROLE_MODULE_PERMISSIONS)[]).filter(
    (role) => ROLE_MODULE_PERMISSIONS[role].includes(module)
  );

  const moduleLabel = module
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-6">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
          <ShieldOff className="w-9 h-9 text-rose-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center">
          <Lock className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-xs">
          Your role <span className="font-semibold text-slate-700">
            {user ? ROLE_INFO_MAP[user.role]?.label : 'Unknown'}
          </span> does not have permission to access <span className="font-semibold text-slate-700">{moduleLabel}</span>.
        </p>
      </div>

      {/* Required roles */}
      {roleThatCanAccess.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 max-w-sm w-full">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Roles with access:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {roleThatCanAccess.map((role) => {
              const info = ROLE_INFO_MAP[role];
              return (
                <span key={role} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${info.badgeClass}`}>
                  {info.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>
    </div>
  );
}
