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
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';

export type NavigationModule =
  | 'dashboard'
  | 'reservations'
  | 'calendar'
  | 'guests'
  | 'follow-ups'
  | 'leads'
  | 'quotations'
  | 'communications'
  | 'properties'
  | 'unit-types'
  | 'units'
  | 'housekeeping'
  | 'maintenance'
  | 'staff-tasks'
  | 'finance'
  | 'payments'
  | 'invoices'
  | 'expenses'
  | 'owner-settlements'
  | 'reviews'
  | 'reports'
  | 'audit'
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

  // Overdue follow-up counter
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

  const navItemClass = (isActive: boolean) =>
    `flex items-center justify-between w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer select-none ${
      isActive
        ? 'bg-teal-700/80 text-white font-semibold shadow-xs'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  const subNavItemClass = (isActive: boolean) =>
    `flex items-center justify-between w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer select-none ${
      isActive
        ? 'text-teal-300 font-semibold bg-teal-950/40'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-200 w-64 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black text-lg tracking-wider shadow-inner">
            OD
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider text-white flex items-center gap-1.5">
              ONE DIRECTORY
            </h1>
            <span className="text-[10px] text-teal-400 uppercase tracking-widest font-semibold">
              Hospitality ERP
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 text-xs">
        {/* Dashboard */}
        <button
          onClick={() => handleNav('dashboard')}
          className={navItemClass(currentModule === 'dashboard')}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4 shrink-0 text-teal-400" />
            <span>Dashboard</span>
          </div>
        </button>

        {/* Reservations Group */}
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
              <button
                onClick={() => handleNav('calendar')}
                className={subNavItemClass(currentModule === 'calendar')}
              >
                <span>Calendar Matrix</span>
                <span className="text-[10px] text-teal-300 font-mono">Gantt</span>
              </button>
              <button
                onClick={() => handleNav('reservations')}
                className={subNavItemClass(currentModule === 'reservations')}
              >
                <span>All Bookings</span>
              </button>
            </div>
          )}
        </div>

        {/* Guests */}
        <button
          onClick={() => handleNav('guests')}
          className={navItemClass(currentModule === 'guests')}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 shrink-0 text-teal-400" />
            <span>Guest Directory</span>
          </div>
        </button>

        {/* CRM Group */}
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
              <button
                onClick={() => handleNav('leads')}
                className={subNavItemClass(currentModule === 'leads')}
              >
                <span>Leads Pipeline</span>
              </button>
              <button
                onClick={() => handleNav('quotations')}
                className={subNavItemClass(currentModule === 'quotations')}
              >
                <span>Quotations</span>
              </button>
              <button
                onClick={() => handleNav('communications')}
                className={subNavItemClass(currentModule === 'communications')}
              >
                <span>Communications Log</span>
              </button>
            </div>
          )}
        </div>

        {/* Properties Group */}
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
              <button
                onClick={() => handleNav('properties')}
                className={subNavItemClass(currentModule === 'properties')}
              >
                <span>Properties (7)</span>
              </button>
              <button
                onClick={() => handleNav('unit-types')}
                className={subNavItemClass(currentModule === 'unit-types')}
              >
                <span>Unit Types</span>
              </button>
              <button
                onClick={() => handleNav('units')}
                className={subNavItemClass(currentModule === 'units')}
              >
                <span>Unit Inventory</span>
              </button>
            </div>
          )}
        </div>

        {/* Operations Group */}
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
              <button
                onClick={() => handleNav('staff-tasks')}
                className={subNavItemClass(currentModule === 'staff-tasks')}
              >
                <span>Staff Tasks</span>
              </button>
            </div>
          )}
        </div>

        {/* Finance Group */}
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
              <button
                onClick={() => handleNav('payments')}
                className={subNavItemClass(currentModule === 'payments')}
              >
                <span>Payments</span>
              </button>
              <button
                onClick={() => handleNav('invoices')}
                className={subNavItemClass(currentModule === 'invoices')}
              >
                <span>Invoices</span>
              </button>
              <button
                onClick={() => handleNav('expenses')}
                className={subNavItemClass(currentModule === 'expenses')}
              >
                <span>Expenses</span>
              </button>
              <button
                onClick={() => handleNav('owner-settlements')}
                className={subNavItemClass(currentModule === 'owner-settlements')}
              >
                <span>Owner Settlements</span>
              </button>
            </div>
          )}
        </div>

        {/* Reviews */}
        <button
          onClick={() => handleNav('reviews')}
          className={navItemClass(currentModule === 'reviews')}
        >
          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Reviews & Reputation</span>
          </div>
        </button>

        {/* Reports */}
        <button
          onClick={() => handleNav('reports')}
          className={navItemClass(currentModule === 'reports')}
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 shrink-0 text-teal-400" />
            <span>Reports & Analytics</span>
          </div>
        </button>

        {/* Audit Log */}
        <button
          onClick={() => handleNav('audit')}
          className={navItemClass(currentModule === 'audit')}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 text-teal-400" />
            <span>Audit Trail</span>
          </div>
        </button>

        {/* Settings */}
        <button
          onClick={() => handleNav('settings')}
          className={navItemClass(currentModule === 'settings')}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 shrink-0 text-teal-400" />
            <span>Settings</span>
          </div>
        </button>
      </div>

      {/* User Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-[#0B1120] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            AD
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Admin User</p>
            <p className="text-[10px] text-teal-400 truncate">Operations Head</p>
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 h-full shadow-2xl">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
