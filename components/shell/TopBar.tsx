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

  const userInitials =
    user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  // Dropdown item base class — consistent across menus
  const dropdownItem =
    'w-full px-4 py-2 text-left text-[13px] text-[#3D4E5C] hover:bg-[#F0EDE6] hover:text-[#1E2A32] flex items-center gap-2.5 transition-colors cursor-pointer';

  return (
    <header className="sticky top-0 z-30 h-12 bg-[#F8F6F1] border-b border-[#E2DDD6] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Hamburger (mobile) + Property Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 text-[#6B7A87] hover:text-[#1E2A32] hover:bg-[#E8E3DA] transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Property Selector — slim inline pill with separator */}
        <div className="flex items-center gap-2 border-r border-[#D8D2C8] pr-4">
          <Building2 className="w-3.5 h-3.5 text-[#9AAAB6] shrink-0" />
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-transparent text-[12px] font-semibold text-[#3D4E5C] focus:outline-none cursor-pointer uppercase tracking-wide"
          >
<<<<<<< Updated upstream
            <option value="all">All Properties (7)</option>
=======
            <option value="all">All Properties</option>
>>>>>>> Stashed changes
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Actions row */}
      <div className="flex items-center gap-1">

        {/* Search — icon only, triggers command palette */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="p-2 text-[#9AAAB6] hover:text-[#3D4E5C] hover:bg-[#EBE7E0] transition-colors"
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* + New Action */}
        <div className="relative" ref={newMenuRef}>
          <Button
            id="topbar-new-action"
            variant="primary"
            size="sm"
            onClick={() => setIsNewMenuOpen((prev) => !prev)}
            className="hidden sm:flex ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </Button>
          <button
            onClick={() => setIsNewMenuOpen((prev) => !prev)}
            className="sm:hidden p-2 bg-[#1C2B35] text-white hover:bg-[#253542] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          {isNewMenuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E2DDD6] shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-1 z-50 animate-fade-in-up">
              <p className="px-4 pt-2 pb-1.5 text-[9px] font-bold text-[#9AAAB6] uppercase tracking-[0.12em]">
                Quick Create
              </p>
              <button onClick={() => handleOpenAction('new-reservation')} className={dropdownItem}>
                <Calendar className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                <span>Reservation</span>
              </button>
              <button onClick={() => handleOpenAction('new-guest')} className={dropdownItem}>
                <UserPlus className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                <span>Guest Profile</span>
              </button>
              <button onClick={() => handleOpenAction('new-lead')} className={dropdownItem}>
                <PhoneCall className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                <span>New Lead</span>
              </button>
              <button onClick={() => handleOpenAction('new-quotation')} className={dropdownItem}>
                <FileText className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                <span>Quotation</span>
              </button>
              <div className="my-1 border-t border-[#E2DDD6]" />
              <button onClick={() => handleOpenAction('record-payment')} className={dropdownItem}>
                <CreditCard className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                <span>Record Payment</span>
              </button>
              <button onClick={() => handleOpenAction('add-expense')} className={dropdownItem}>
                <Receipt className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                <span>Log Expense</span>
              </button>
              <div className="my-1 border-t border-[#E2DDD6]" />
              <button onClick={() => handleOpenAction('maintenance-ticket')} className={dropdownItem}>
                <Wrench className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                <span>Maintenance Ticket</span>
              </button>
              <button onClick={() => handleOpenAction('housekeeping-task')} className={dropdownItem}>
                <Sparkles className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                <span>Housekeeping Task</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="p-2 text-[#9AAAB6] hover:text-[#3D4E5C] hover:bg-[#EBE7E0] relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8B3A3A] border border-[#F8F6F1] rounded-full" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white border border-[#E2DDD6] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 animate-fade-in-up">
              <div className="px-4 py-3 border-b border-[#E2DDD6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1E2A32] uppercase tracking-wider">
                    Notifications
                  </h4>
                  {unreadNotifs.length > 0 && (
                    <Badge variant="danger" size="xs">
                      {unreadNotifs.length} new
                    </Badge>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#2E6E8E] hover:text-[#275E7A] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F0EDE6]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#9AAAB6]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
<<<<<<< Updated upstream
                      className={`px-4 py-3 hover:bg-[#F8F6F1] transition-colors cursor-pointer ${!notif.read ? 'border-l-2 border-l-[#2E6E8E]' : 'border-l-2 border-l-transparent'
=======
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-teal-50/40' : ''
>>>>>>> Stashed changes
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#1E2A32]">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[#9AAAB6] whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7A87] mt-0.5 line-clamp-2">
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
            className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-[#D8D2C8] hover:opacity-80 transition-opacity cursor-pointer"
          >
            {/* Initials — clean, no rounded full */}
            <div className="w-6 h-6 bg-[#1C2B35] text-white flex items-center justify-center font-bold text-[10px] rounded-[2px]">
              {userInitials}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-[11px] font-bold text-[#1E2A32] leading-tight tracking-tight">
                {user?.name?.split(' ')[0] || 'User'}
              </p>
              <p className="text-[9px] font-semibold text-[#9AAAB6] uppercase tracking-wider">
                {roleInfo?.label || user?.role}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#9AAAB6] hidden lg:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1 w-72 bg-white border border-[#E2DDD6] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 animate-fade-in-up">
              {/* User info header */}
              <div className="px-4 py-4 border-b border-[#E2DDD6] bg-[#F8F6F1]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#1C2B35] text-white flex items-center justify-center font-bold text-sm shrink-0 rounded-[2px]">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E2A32]">{user?.name}</p>
                    <p className="text-xs text-[#9AAAB6]">{user?.email}</p>
                    {roleInfo && (
                      <Badge variant="neutral" size="xs" className="mt-1">
                        {roleInfo.label}
                      </Badge>
                    )}
                  </div>
                </div>
                {user?.department && (
                  <p className="text-xs text-[#9AAAB6] mt-2 pl-0">{user.department}</p>
                )}
              </div>

              {/* Demo Role Switcher */}
              <div className="px-4 py-3 border-b border-[#E2DDD6]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3 h-3 text-[#7A5C2E]" />
                  <p className="text-[9px] font-bold text-[#9AAAB6] uppercase tracking-[0.12em]">
                    Switch Demo Role
                  </p>
                </div>
                <div className="space-y-0.5">
                  {DEMO_ACCOUNTS.map(({ role }) => {
                    const info = ROLE_INFO_MAP[role];
                    const isCurrent = user?.role === role;
                    const isSwitching = switchingRole === role;
                    return (
                      <button
                        key={role}
                        onClick={() => !isCurrent && handleDemoSwitch(role)}
                        disabled={isCurrent || !!switchingRole}
<<<<<<< Updated upstream
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors ${isCurrent
                            ? 'bg-[#EAF0F8] text-[#2E5E8E] cursor-default border-l-2 border-[#2E6E8E]'
                            : 'text-[#3D4E5C] hover:bg-[#F0EDE6] cursor-pointer disabled:opacity-60 disabled:cursor-wait'
=======
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${isCurrent
                            ? 'bg-teal-50 border border-teal-200 cursor-default'
                            : 'hover:bg-slate-50 cursor-pointer disabled:opacity-60 disabled:cursor-wait'
>>>>>>> Stashed changes
                          }`}
                      >
                        <span className="font-medium">{info.label}</span>
                        <div className="flex items-center gap-1.5">
                          {isSwitching && (
                            <div className="w-3 h-3 border border-[#2E6E8E] border-t-transparent rounded-full animate-spin" />
                          )}
                          {isCurrent && !isSwitching && (
                            <span className="text-[8px] text-[#2E6E8E] font-bold uppercase tracking-wider">Active</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sign Out */}
              <div className="px-4 py-2">
                <button
                  id="topbar-sign-out"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-[#8B3A3A] hover:bg-[#F5EAEA] text-sm font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
