'use client';

import React, { useState, useCallback } from 'react';
import { UserRole } from '@prisma/client';
import { useAuth, DEMO_ACCOUNTS } from '@/context/AuthContext';
import { ROLE_INFO_MAP } from '@/lib/rbac';
import { Eye, EyeOff, LogIn, Zap, Building2 } from 'lucide-react';

export function LoginView() {
  const { login, switchDemoRole, loginError, clearLoginError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) return;
      setIsSubmitting(true);
      await login(email.trim(), password);
      setIsSubmitting(false);
    },
    [login, email, password]
  );

  const handleDemoSwitch = useCallback(
    async (role: UserRole) => {
      setSwitchingRole(role);
      clearLoginError();
      const account = DEMO_ACCOUNTS.find((a) => a.role === role);
      if (account) {
        setEmail(account.email);
        setPassword(account.password);
        await switchDemoRole(role);
      }
      setSwitchingRole(null);
    },
    [switchDemoRole, clearLoginError]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const demoRoles: UserRole[] = ['ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK', 'OPERATIONS', 'ACCOUNTANT'];

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950" />
        {/* Decorative rings */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-teal-700/20" />
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full border border-teal-600/20" />
        <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full border border-teal-800/30 -translate-y-1/2" />
        <div className="absolute -bottom-20 right-20 w-80 h-80 rounded-full border border-teal-700/20" />
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-400 tracking-widest uppercase">One Directory</p>
              <p className="text-lg font-bold text-white leading-tight">ERP Platform</p>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Hospitality
            <span className="block text-teal-400">operations,</span>
            unified.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Manage your properties, reservations, CRM pipeline, housekeeping, finance,
            and more — all from one intelligent platform.
          </p>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Properties', value: '7 Active' },
              { label: 'Occupancy', value: '78.4%' },
              { label: 'Revenue (MTD)', value: '₹12.4L' },
              { label: 'Arrivals Today', value: '14 Guests' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{stat.label}</p>
                <p className="text-base font-bold text-white mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-slate-900" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-teal-400 tracking-widest uppercase">One Directory</p>
              <p className="text-base font-bold text-white">ERP Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearLoginError(); }}
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearLoginError(); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <span className="text-rose-400 text-xs leading-relaxed">{loginError}</span>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-teal-900/40"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Demo — Try a Role</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {demoRoles.map((role) => {
                const info = ROLE_INFO_MAP[role];
                const isSwitching = switchingRole === role;
                return (
                  <button
                    key={role}
                    id={`demo-role-${role.toLowerCase()}`}
                    onClick={() => handleDemoSwitch(role)}
                    disabled={!!switchingRole}
                    className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/40 hover:border-slate-600/60 rounded-xl text-left transition-all group disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isSwitching ? (
                      <div className="w-4 h-4 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin shrink-0" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full shrink-0 ${info.badgeClass.includes('purple') ? 'bg-purple-400' : info.badgeClass.includes('teal') ? 'bg-teal-400' : info.badgeClass.includes('sky') ? 'bg-sky-400' : info.badgeClass.includes('amber') ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">{info.label}</p>
                      <p className="text-[10px] text-slate-500 truncate">{DEMO_ACCOUNTS.find(a => a.role === role)?.email}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${info.badgeClass} shrink-0`}>
                      {role === 'PROPERTY_MANAGER' ? 'MANAGER' : role === 'FRONT_DESK' ? 'FRONT DESK' : role}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-3">All demo accounts use password: <span className="text-slate-500 font-mono">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
