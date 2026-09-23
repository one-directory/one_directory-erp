'use client';

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  PhoneCall,
  Target,
  FileText,
  Building2,
  BedDouble,
  Sparkles,
  Wrench,
  CheckSquare,
  CreditCard,
  Receipt,
  Wallet,
  Landmark,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Plus,
  MessageSquare,
  Star,
  Hotel,
  Globe2,
  Wifi,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { useAuth } from '@/context/AuthContext';
import { hasModuleAccess, ROLE_INFO_MAP } from '@/lib/rbac';

export type NavigationModule =
  | 'dashboard'
  | 'reservations'
  | 'calendar'
  | 'follow-ups'
  | 'quotations'
  | 'communications'
  | 'properties'
  | 'units'
  | 'housekeeping'
  | 'maintenance'
  | 'finance'
  | 'payments'
  | 'invoices'
  | 'expenses'
  | 'owner-settlements'
  | 'channels'
  | 'reviews'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentModule,
  onSelectModule,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const { followUps, housekeepingTasks, maintenanceTickets, openGlobalModal } = useERP();
  const { user } = useAuth();
  const role = user?.role;

  const allowed = (mod: NavigationModule) => hasModuleAccess(role, mod);

  const overdueFollowUpsCount = followUps.filter((f) => f.status === 'Overdue').length;
  const pendingHkCount = housekeepingTasks.filter((h) => h.status === 'Pending' || h.status === 'Cleaning').length;
  const openMtCount = maintenanceTickets.filter((m) => m.status === 'Open' || m.status === 'Assigned').length;

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    reservations: true,
    crm: true,
    properties: true,
    operations: true,
    finance: false,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleNav = (mod: NavigationModule) => {
    onSelectModule(mod);
    if (onCloseMobile) onCloseMobile();
  };

  // Top-level nav item — icon + label, active has left rule + lighter bg
  const navItemClass = (isActive: boolean) =>
<<<<<<< Updated upstream
    `flex items-center justify-between w-full px-3 py-2 text-[12px] font-medium transition-colors duration-100 cursor-pointer select-none ${isActive
      ? 'bg-[#233040] text-[#E8EFF4] border-l-2 border-[#2E6E8E] pl-[10px]'
      : 'text-[#8AA0B0] hover:text-[#C8D8E4] hover:bg-[#1E303D] border-l-2 border-transparent pl-[10px]'
=======
    `flex items-center justify-between w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer select-none ${isActive
      ? 'bg-teal-700/80 text-white font-semibold shadow-xs'
      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
>>>>>>> Stashed changes
    }`;

  // Sub-nav items — slightly smaller, more indent
  const subNavItemClass = (isActive: boolean) =>
<<<<<<< Updated upstream
    `flex items-center justify-between w-full pl-8 pr-3 py-[5px] text-[11px] font-medium transition-colors duration-100 cursor-pointer select-none ${isActive
      ? 'text-[#D4E4EF] bg-[#1E303D]'
      : 'text-[#617A8A] hover:text-[#A0BCC8] hover:bg-[#1A2C39]'
=======
    `flex items-center justify-between w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer select-none ${isActive
      ? 'text-teal-300 font-semibold bg-teal-950/40'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
>>>>>>> Stashed changes
    }`;

  // Section header — letterpress labels, all-caps, tracked
  const groupHeaderClass =
    'flex items-center justify-between w-full px-3 py-1.5 text-[9px] font-semibold tracking-[0.12em] uppercase text-[#4A6070] hover:text-[#6A8090] transition-colors duration-100 cursor-pointer';

  // Badge for counts in sidebar
  const countBadge = (count: number, variant: 'alert' | 'warn') =>
    count > 0 ? (
      <span
        className={`text-[9px] font-bold px-1.5 py-[2px] rounded-[1px] min-w-[18px] text-center ${variant === 'alert'
            ? 'bg-[#5A2020] text-[#E8A0A0]'
            : 'bg-[#4A3A14] text-[#D4A850]'
          }`}
      >
        {count}
      </span>
    ) : null;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1C2B35] text-[#8AA0B0] w-56 border-r border-[#28394A] select-none">
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-[#28394A]">
        <div className="flex items-center gap-3">
          {/* Monogram — no rounded box, just typography */}
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <span className="text-[#2E6E8E] font-bold text-sm tracking-widest leading-none">OD</span>
          </div>
          <div>
            <h1 className="font-bold text-[12px] tracking-[0.08em] uppercase text-[#C8D8E4]">
              One Directory
            </h1>
            <span className="text-[9px] text-[#4A6070] uppercase tracking-[0.12em] font-medium">
              Hospitality ERP
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 space-y-0">

        {/* Dashboard */}
        <button
          onClick={() => handleNav('dashboard')}
          className={navItemClass(currentModule === 'dashboard')}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span>Dashboard</span>
          </div>
        </button>

        {/* ── RESERVATIONS ── */}
        {(allowed('calendar') || allowed('reservations')) && (
<<<<<<< Updated upstream
          <div className="pt-3">
            <button onClick={() => toggleGroup('reservations')} className={groupHeaderClass}>
              <span>Reservations</span>
              {expandedGroups.reservations
                ? <ChevronDown className="w-2.5 h-2.5" />
                : <ChevronRight className="w-2.5 h-2.5" />}
            </button>
            {expandedGroups.reservations && (
              <div className="mt-0.5">
                {allowed('calendar') && (
                  <button onClick={() => handleNav('calendar')} className={subNavItemClass(currentModule === 'calendar')}>
                    <span>Calendar Matrix</span>
                    <span className="text-[8px] text-[#4A6070] font-medium uppercase tracking-wider">Gantt</span>
                  </button>
                )}
                {allowed('reservations') && (
                  <button onClick={() => handleNav('reservations')} className={subNavItemClass(currentModule === 'reservations')}>
                    <span>All Bookings</span>
=======
          <div>
            <button
              onClick={() => toggleGroup('reservations')}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Reservations</span>
              </div>
              {expandedGroups.reservations ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedGroups.reservations && (
              <div className="mt-0.5 space-y-0.5">
                {allowed('calendar') && (
                  <button
                    onClick={() => handleNav('calendar')}
                    className={subNavItemClass(currentModule === 'calendar')}
                  >
                    <span>Calendar Matrix</span>
                    <span className="text-[10px] text-teal-300 font-mono">Gantt</span>
                  </button>
                )}
                {allowed('reservations') && (
                  <button
                    onClick={() => handleNav('reservations')}
                    className={subNavItemClass(currentModule === 'reservations')}
                  >
                    <span>All Bookings</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Guests */}
        {allowed('guests') && (
          <button
            onClick={() => handleNav('guests')}
            className={navItemClass(currentModule === 'guests')}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0 text-teal-400" />
              <span>Guest Directory</span>
            </div>
          </button>
        )}

        {/* CRM Group */}
        {(allowed('follow-ups') || allowed('leads') || allowed('quotations') || allowed('communications')) && (
          <div>
            <button
              onClick={() => toggleGroup('crm')}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
                <span>CRM & Follow-ups</span>
              </div>
              {expandedGroups.crm ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedGroups.crm && (
              <div className="mt-0.5 space-y-0.5">
                {allowed('follow-ups') && (
                  <button
                    onClick={() => handleNav('follow-ups')}
                    className={subNavItemClass(currentModule === 'follow-ups')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Follow-up Center</span>
                    </div>
                    {overdueFollowUpsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                        {overdueFollowUpsCount} overdue
                      </span>
                    )}
                  </button>
                )}
                {allowed('leads') && (
                  <button
                    onClick={() => handleNav('leads')}
                    className={subNavItemClass(currentModule === 'leads')}
                  >
                    <span>Leads Pipeline</span>
                  </button>
                )}
                {allowed('quotations') && (
                  <button
                    onClick={() => handleNav('quotations')}
                    className={subNavItemClass(currentModule === 'quotations')}
                  >
                    <span>Quotations</span>
                  </button>
                )}
                {allowed('communications') && (
                  <button
                    onClick={() => handleNav('communications')}
                    className={subNavItemClass(currentModule === 'communications')}
                  >
                    <span>Communications Log</span>
>>>>>>> Stashed changes
                  </button>
                )}
              </div>
            )}
          </div>
        )}

<<<<<<< Updated upstream
        {/* ── CRM ── */}
        {(allowed('follow-ups') || allowed('quotations') || allowed('communications')) && (
          <div className="pt-3">
            <button onClick={() => toggleGroup('crm')} className={groupHeaderClass}>
              <span>CRM &amp; Follow-ups</span>
              {expandedGroups.crm
                ? <ChevronDown className="w-2.5 h-2.5" />
                : <ChevronRight className="w-2.5 h-2.5" />}
            </button>
            {expandedGroups.crm && (
              <div className="mt-0.5">
                {allowed('follow-ups') && (
                  <button onClick={() => handleNav('follow-ups')} className={subNavItemClass(currentModule === 'follow-ups')}>
                    <span>Follow-up Center</span>
                    {countBadge(overdueFollowUpsCount, 'alert')}
                  </button>
                )}
                {allowed('quotations') && (
                  <button onClick={() => handleNav('quotations')} className={subNavItemClass(currentModule === 'quotations')}>
                    <span>Quotations</span>
                  </button>
                )}
                {allowed('communications') && (
                  <button onClick={() => handleNav('communications')} className={subNavItemClass(currentModule === 'communications')}>
                    <span>Communications Log</span>
=======
        {/* Properties Group */}
        {(allowed('properties') || allowed('unit-types') || allowed('units')) && (
          <div>
            <button
              onClick={() => toggleGroup('properties')}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Properties</span>
              </div>
              {expandedGroups.properties ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedGroups.properties && (
              <div className="mt-0.5 space-y-0.5">
                {allowed('properties') && (
                  <button
                    onClick={() => handleNav('properties')}
                    className={subNavItemClass(currentModule === 'properties')}
                  >
                    <span>Properties</span>
                  </button>
                )}
                {allowed('unit-types') && (
                  <button
                    onClick={() => handleNav('unit-types')}
                    className={subNavItemClass(currentModule === 'unit-types')}
                  >
                    <span>Unit Types</span>
                  </button>
                )}
                {allowed('units') && (
                  <button
                    onClick={() => handleNav('units')}
                    className={subNavItemClass(currentModule === 'units')}
                  >
                    <span>Unit Inventory</span>
>>>>>>> Stashed changes
                  </button>
                )}
              </div>
            )}
          </div>
        )}

<<<<<<< Updated upstream
        {/* ── PROPERTIES ── */}
        {(allowed('properties') || allowed('units')) && (
          <div className="pt-3">
            <button onClick={() => toggleGroup('properties')} className={groupHeaderClass}>
              <span>Properties</span>
              {expandedGroups.properties
                ? <ChevronDown className="w-2.5 h-2.5" />
                : <ChevronRight className="w-2.5 h-2.5" />}
            </button>
            {expandedGroups.properties && (
              <div className="mt-0.5">
                {allowed('properties') && (
                  <button onClick={() => handleNav('properties')} className={subNavItemClass(currentModule === 'properties')}>
                    <span>Properties (7)</span>
                  </button>
                )}
                {allowed('units') && (
                  <button onClick={() => handleNav('units')} className={subNavItemClass(currentModule === 'units')}>
                    <span>Unit Inventory</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── OPERATIONS ── */}
        {(allowed('housekeeping') || allowed('maintenance')) && (
          <div className="pt-3">
            <button onClick={() => toggleGroup('operations')} className={groupHeaderClass}>
              <span>Operations</span>
              {expandedGroups.operations
                ? <ChevronDown className="w-2.5 h-2.5" />
                : <ChevronRight className="w-2.5 h-2.5" />}
            </button>
            {expandedGroups.operations && (
              <div className="mt-0.5">
                {allowed('housekeeping') && (
                  <button onClick={() => handleNav('housekeeping')} className={subNavItemClass(currentModule === 'housekeeping')}>
                    <span>Housekeeping</span>
                    {countBadge(pendingHkCount, 'warn')}
                  </button>
                )}
                {allowed('maintenance') && (
                  <button onClick={() => handleNav('maintenance')} className={subNavItemClass(currentModule === 'maintenance')}>
                    <span>Maintenance</span>
                    {countBadge(openMtCount, 'alert')}
=======
        {/* Operations Group */}
        {(allowed('housekeeping') || allowed('maintenance') || allowed('staff-tasks')) && (
          <div>
            <button
              onClick={() => toggleGroup('operations')}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Operations</span>
              </div>
              {expandedGroups.operations ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedGroups.operations && (
              <div className="mt-0.5 space-y-0.5">
                {allowed('housekeeping') && (
                  <button
                    onClick={() => handleNav('housekeeping')}
                    className={subNavItemClass(currentModule === 'housekeeping')}
                  >
                    <span>Housekeeping</span>
                    {pendingHkCount > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 rounded-full bg-amber-500/20 text-amber-300">
                        {pendingHkCount}
                      </span>
                    )}
                  </button>
                )}
                {allowed('maintenance') && (
                  <button
                    onClick={() => handleNav('maintenance')}
                    className={subNavItemClass(currentModule === 'maintenance')}
                  >
                    <span>Maintenance</span>
                    {openMtCount > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 rounded-full bg-rose-500/20 text-rose-300">
                        {openMtCount}
                      </span>
                    )}
                  </button>
                )}
                {allowed('staff-tasks') && (
                  <button
                    onClick={() => handleNav('staff-tasks')}
                    className={subNavItemClass(currentModule === 'staff-tasks')}
                  >
                    <span>Staff Tasks</span>
>>>>>>> Stashed changes
                  </button>
                )}
              </div>
            )}
          </div>
        )}

<<<<<<< Updated upstream
        {/* ── FINANCE ── */}
        {(allowed('payments') || allowed('invoices') || allowed('expenses') || allowed('owner-settlements')) && (
          <div className="pt-3">
            <button onClick={() => toggleGroup('finance')} className={groupHeaderClass}>
              <span>Finance</span>
              {expandedGroups.finance
                ? <ChevronDown className="w-2.5 h-2.5" />
                : <ChevronRight className="w-2.5 h-2.5" />}
            </button>
            {expandedGroups.finance && (
              <div className="mt-0.5">
                {allowed('payments') && (
                  <button onClick={() => handleNav('payments')} className={subNavItemClass(currentModule === 'payments')}>
=======
        {/* Finance Group */}
        {(allowed('payments') || allowed('invoices') || allowed('expenses') || allowed('owner-settlements')) && (
          <div>
            <button
              onClick={() => toggleGroup('finance')}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-teal-400" />
                <span>Finance</span>
              </div>
              {expandedGroups.finance ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {expandedGroups.finance && (
              <div className="mt-0.5 space-y-0.5">
                {allowed('payments') && (
                  <button
                    onClick={() => handleNav('payments')}
                    className={subNavItemClass(currentModule === 'payments')}
                  >
>>>>>>> Stashed changes
                    <span>Payments</span>
                  </button>
                )}
                {allowed('invoices') && (
<<<<<<< Updated upstream
                  <button onClick={() => handleNav('invoices')} className={subNavItemClass(currentModule === 'invoices')}>
=======
                  <button
                    onClick={() => handleNav('invoices')}
                    className={subNavItemClass(currentModule === 'invoices')}
                  >
>>>>>>> Stashed changes
                    <span>Invoices</span>
                  </button>
                )}
                {allowed('expenses') && (
<<<<<<< Updated upstream
                  <button onClick={() => handleNav('expenses')} className={subNavItemClass(currentModule === 'expenses')}>
=======
                  <button
                    onClick={() => handleNav('expenses')}
                    className={subNavItemClass(currentModule === 'expenses')}
                  >
>>>>>>> Stashed changes
                    <span>Expenses</span>
                  </button>
                )}
                {allowed('owner-settlements') && (
<<<<<<< Updated upstream
                  <button onClick={() => handleNav('owner-settlements')} className={subNavItemClass(currentModule === 'owner-settlements')}>
=======
                  <button
                    onClick={() => handleNav('owner-settlements')}
                    className={subNavItemClass(currentModule === 'owner-settlements')}
                  >
>>>>>>> Stashed changes
                    <span>Owner Settlements</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

<<<<<<< Updated upstream
        {/* Hairline separator */}
        <div className="mx-3 my-3 border-t border-[#28394A]" />

        {/* Channel Manager */}
        {allowed('channels') && (
          <button onClick={() => handleNav('channels')} className={navItemClass(currentModule === 'channels')}>
            <div className="flex items-center gap-2.5">
              <Globe2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>Channel Manager</span>
            </div>
            <span className="text-[8px] font-bold tracking-widest uppercase text-[#4A6070]">OTA</span>
=======
        {/* Channel Manager (OTAs) */}
        {allowed('channels') && (
          <button
            onClick={() => handleNav('channels')}
            className={navItemClass(currentModule === 'channels')}
          >
            <div className="flex items-center gap-2.5">
              <Globe2 className="w-4 h-4 shrink-0 text-violet-400" />
              <span>Channel Manager</span>
            </div>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 tracking-wide">
              OTA
            </span>
>>>>>>> Stashed changes
          </button>
        )}

        {/* Reviews */}
        {allowed('reviews') && (
<<<<<<< Updated upstream
          <button onClick={() => handleNav('reviews')} className={navItemClass(currentModule === 'reviews')}>
            <div className="flex items-center gap-2.5">
              <Star className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>Reviews &amp; Reputation</span>
=======
          <button
            onClick={() => handleNav('reviews')}
            className={navItemClass(currentModule === 'reviews')}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Reviews & Reputation</span>
>>>>>>> Stashed changes
            </div>
          </button>
        )}

        {/* Reports */}
        {allowed('reports') && (
<<<<<<< Updated upstream
          <button onClick={() => handleNav('reports')} className={navItemClass(currentModule === 'reports')}>
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span>Reports &amp; Analytics</span>
=======
          <button
            onClick={() => handleNav('reports')}
            className={navItemClass(currentModule === 'reports')}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 shrink-0 text-teal-400" />
              <span>Reports & Analytics</span>
            </div>
          </button>
        )}

        {/* Audit Log */}
        {allowed('audit') && (
          <button
            onClick={() => handleNav('audit')}
            className={navItemClass(currentModule === 'audit')}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-teal-400" />
              <span>Audit Trail</span>
>>>>>>> Stashed changes
            </div>
          </button>
        )}

        {/* Settings */}
        {allowed('settings') && (
<<<<<<< Updated upstream
          <button onClick={() => handleNav('settings')} className={navItemClass(currentModule === 'settings')}>
            <div className="flex items-center gap-2.5">
              <Settings className="w-3.5 h-3.5 shrink-0 opacity-70" />
=======
          <button
            onClick={() => handleNav('settings')}
            className={navItemClass(currentModule === 'settings')}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 shrink-0 text-teal-400" />
>>>>>>> Stashed changes
              <span>Settings</span>
            </div>
          </button>
        )}
      </div>

      {/* User Footer — minimal, no avatar box */}
      <div className="px-4 py-3 border-t border-[#28394A]">
        <div className="flex items-center gap-2.5">
          {/* Initials — just text, no box */}
          <span className="text-[11px] font-bold text-[#4A6070] shrink-0 w-6 text-center">
            {user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </span>
          <div className="min-w-0 border-l border-[#28394A] pl-2.5">
            <p className="text-[11px] font-semibold text-[#A0BCC8] truncate leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-[9px] text-[#4A6070] truncate uppercase tracking-wider font-medium">
              {role ? (ROLE_INFO_MAP[role]?.label ?? role) : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0 h-screen sticky top-0">{sidebarContent}</div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#1E2A32]/50 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-56 h-full shadow-xl">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
