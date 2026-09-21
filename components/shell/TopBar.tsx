'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Building2,
  Calendar,
  UserPlus,
  PhoneCall,
  FileText,
  CreditCard,
  Receipt,
  Wrench,
  Sparkles,
  Menu,
  ChevronDown,
  CheckCheck,
  CheckCircle2,
  LogOut,
  User,
  Zap,
} from 'lucide-react';
import { useERP, GlobalModalType } from '@/context/ERPContext';
import { useAuth, DEMO_ACCOUNTS } from '@/context/AuthContext';
import { ROLE_INFO_MAP } from '@/lib/rbac';
import { UserRole } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export function TopBar({ onOpenMobileMenu }: TopBarProps) {
  const {
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    setIsCommandPaletteOpen,
    openGlobalModal,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useERP();

  const { user, roleInfo, logout, switchDemoRole } = useAuth();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);

  const newMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAction = (type: GlobalModalType) => {
    setIsNewMenuOpen(false);
    openGlobalModal(type);
  };

  const handleDemoSwitch = async (role: UserRole) => {
    setSwitchingRole(role);
    setIsUserMenuOpen(false);
    await switchDemoRole(role);
    setSwitchingRole(null);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
  };

  const userInitials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left section: Hamburger for mobile + Property Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Property Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
          <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
          >
            <option value="all">All Properties (7 Active)</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name} ({prop.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Search Trigger (Ctrl+K) */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-left"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="flex-1">Search anything...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 text-slate-500 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* + New Action */}
        <div className="relative" ref={newMenuRef}>
          <Button
            id="topbar-new-action"
            variant="primary"
            size="sm"
            onClick={() => setIsNewMenuOpen((prev) => !prev)}
            className="hidden sm:flex"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
          <button
            onClick={() => setIsNewMenuOpen((prev) => !prev)}
            className="sm:hidden p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          {isNewMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <p className="px-3.5 pt-1 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quick Create</p>
              <button
                onClick={() => handleOpenAction('new-reservation')}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Reservation</span>
              </button>
              <button
                onClick={() => handleOpenAction('new-guest')}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>Guest Profile</span>
              </button>
              <button
                onClick={() => handleOpenAction('new-lead')}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-teal-600" />
                <span>New Lead</span>
              </button>
              <button
                onClick={() => handleOpenAction('new-quotation')}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Quotation</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => handleOpenAction('record-payment')}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-teal-600" />
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => handleOpenAction('add-expense')}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-teal-600" />
                <span>Log Expense</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => handleOpenAction('maintenance-ticket')}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-teal-600" />
                <span>Maintenance Ticket</span>
              </button>
              <button
                onClick={() => handleOpenAction('housekeeping-task')}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Housekeeping Task</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadNotifs.length > 0 && (
                    <Badge variant="danger" size="xs">
                      {unreadNotifs.length} new
                    </Badge>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="topbar-user-menu"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {userInitials}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name?.split(' ')[0] || 'User'}</p>
              <p className={`text-[10px] font-semibold ${roleInfo?.badgeClass.split(' ')[1] || 'text-teal-600'}`}>
                {roleInfo?.label || user?.role}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              {/* User info header */}
              <div className="px-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                    {roleInfo && (
                      <span className={`inline-flex mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.badgeClass}`}>
                        {roleInfo.label}
                      </span>
                    )}
                  </div>
                </div>
                {user?.department && (
                  <p className="text-xs text-slate-400 mt-2">{user.department}</p>
                )}
              </div>

              {/* Demo Role Switcher */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Switch Demo Role</p>
                </div>
                <div className="space-y-1">
                  {DEMO_ACCOUNTS.map(({ role }) => {
                    const info = ROLE_INFO_MAP[role];
                    const isCurrent = user?.role === role;
                    const isSwitching = switchingRole === role;
                    return (
                      <button
                        key={role}
                        onClick={() => !isCurrent && handleDemoSwitch(role)}
                        disabled={isCurrent || !!switchingRole}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isCurrent
                            ? 'bg-teal-50 border border-teal-200 cursor-default'
                            : 'hover:bg-slate-50 cursor-pointer disabled:opacity-60 disabled:cursor-wait'
                        }`}
                      >
                        <span className="font-medium text-slate-700">{info.label}</span>
                        <div className="flex items-center gap-1.5">
                          {isSwitching && (
                            <div className="w-3 h-3 border border-teal-400 border-t-transparent rounded-full animate-spin" />
                          )}
                          {isCurrent && !isSwitching && (
                            <span className="text-[9px] text-teal-600 font-bold">ACTIVE</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sign Out */}
              <div className="px-4 pt-2">
                <button
                  id="topbar-sign-out"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

