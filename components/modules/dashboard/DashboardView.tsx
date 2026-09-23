'use client';

import React, { useState, useEffect } from 'react';
import { useERP } from '@/context/ERPContext';
import { StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  TrendingUp,
  CreditCard,
  Calendar,
  Phone,
  MessageSquare,
  Loader2,
} from 'lucide-react';

// Live KPI shape from /api/reports/dashboard
interface DashboardKPIs {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalGuests: number;
  activeReservations: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  pendingLeads: number;
  openTasks: number;
  openMaintenance: number;
  pendingInvoices: number;
  pendingReviews: number;
  revenueThisMonth: number;
}

// Revenue-by-property shape from /api/reports/revenue
interface PropertyRevenue {
  propertyId: string;
  propertyName: string;
  revenue: number;
}

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function DashboardView() {
  const {
    selectedPropertyId,
    selectedProperty,
    reservations,
    followUps,
    checkInGuest,
    checkOutGuest,
    openDrawer,
    openGlobalModal,
    showToast,
  } = useERP();

  // ── Live KPI state ──────────────────────────────────────
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [propertyRevenue, setPropertyRevenue] = useState<PropertyRevenue[]>([]);
  const [kpisLoading, setKpisLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2026-09-23"
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }); // e.g. "23 September 2026"
  const todayShort = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }); // e.g. "23 Sep 2026"

  const currentYear = new Date().getFullYear();
  const currentMonthLabel = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  // Fetch live KPIs whenever property filter changes
  useEffect(() => {
    async function fetchKPIs() {
      setKpisLoading(true);
      try {
        const pid = selectedPropertyId === 'all' ? '' : selectedPropertyId;
        const [kpiRes, revRes] = await Promise.all([
          fetch(`/api/reports/dashboard${pid ? `?propertyId=${pid}` : ''}`),
          fetch(`/api/reports/revenue?year=${currentYear}${pid ? `&propertyId=${pid}` : ''}`),
        ]);
        if (kpiRes.ok) {
          const json = await kpiRes.json();
          if (json.success) setKpis(json.data.kpis);
        }
        if (revRes.ok) {
          const json = await revRes.json();
          if (json.success) setPropertyRevenue(json.data.propertyRevenue || []);
        }
      } catch {
        // silently degrade - context state still displayed
      } finally {
        setKpisLoading(false);
      }
    }
    fetchKPIs();
    // Poll every 60s for live ops feel
    const interval = setInterval(fetchKPIs, 60000);
    return () => clearInterval(interval);
  }, [selectedPropertyId, currentYear]);

  // Filter reservations & follow-ups by global property if selected
  const filteredReservations = reservations.filter(
    (r) => selectedPropertyId === 'all' || r.propertyId === selectedPropertyId
  );
  const filteredFollowUps = followUps.filter(
    (f) => selectedPropertyId === 'all' || f.propertyId === selectedPropertyId
  );

  // Today's arrivals & departures from context (real-time after check-in/out)
  const todayArrivals = filteredReservations.filter(
    (r) => r.checkIn === todayStr || r.status === 'Confirmed'
  );
  const todayDepartures = filteredReservations.filter(
    (r) => r.checkOut === todayStr || r.status === 'Checked In'
  );
  const followUpsDueToday = filteredFollowUps.filter(
    (f) => f.urgency === 'Due Today' || f.urgency === 'Overdue'
  );

  const [dateRange, setDateRange] = useState('Today');

  // Derive revenue bar chart from live data; fall back gracefully
  const maxRevenue = Math.max(...propertyRevenue.map((p) => p.revenue), 1);

  // Occupancy rate display
  const occupancyDisplay = kpis
    ? `${kpis.occupancyRate}%`
    : selectedProperty
    ? `${selectedProperty.occupancyRate}%`
    : '—';

  const revenueDisplay = kpis
    ? formatINR(kpis.revenueThisMonth)
    : selectedProperty
    ? formatINR(selectedProperty.revenueThisMonth)
    : '—';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Good morning, Admin</h1>
            <Badge variant="success" size="xs">
              Live Ops
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>
              Date: <strong>{todayLabel}</strong>
            </span>
            <span>•</span>
            <span>
              Scope:{' '}
              <strong className="text-teal-700">
                {selectedProperty
                  ? selectedProperty.name
                  : `All Properties${kpis ? ` (${kpis.totalProperties} Active)` : ''}`}
              </strong>
            </span>
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          {['Today', 'Yesterday', 'Last 7 Days', 'This Month'].map((tab) => (
            <button
              key={tab}
              onClick={() => setDateRange(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                dateRange === tab
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TOP KPI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Properties"
          value={
            kpisLoading
              ? '…'
              : selectedProperty
              ? '1 Selected'
              : kpis
              ? String(kpis.totalProperties)
              : '—'
          }
          subtitle={
            kpisLoading
              ? 'Loading…'
              : selectedProperty
              ? selectedProperty.type
              : kpis
              ? `${kpis.totalUnits} Total Units`
              : 'No data'
          }
          change={kpis ? `${kpis.vacantUnits} units vacant` : ''}
          trend="neutral"
          icon={<Building2 className="w-5 h-5 text-teal-700" />}
        />
        <StatCard
          title="Average Occupancy"
          value={kpisLoading ? '…' : occupancyDisplay}
          subtitle={
            kpis
              ? `${kpis.occupiedUnits} of ${kpis.totalUnits} units occupied`
              : 'Across all units'
          }
          change={kpis ? `${kpis.vacantUnits} vacant` : ''}
          trend={kpis ? (kpis.occupancyRate >= 70 ? 'up' : 'down') : 'neutral'}
          icon={<TrendingUp className="w-5 h-5 text-teal-700" />}
        />
        <StatCard
          title={`Revenue — ${currentMonthLabel}`}
          value={kpisLoading ? '…' : revenueDisplay}
          subtitle={kpis ? `${kpis.pendingInvoices} invoices pending` : 'Real-time from payments'}
          change=""
          trend="up"
          icon={<CreditCard className="w-5 h-5 text-teal-700" />}
        />
        <StatCard
          title="Active Bookings"
          value={kpisLoading ? '…' : kpis ? String(kpis.activeReservations) : String(filteredReservations.length)}
          subtitle={
            kpis
              ? `${kpis.todayCheckIns} arrivals · ${kpis.todayCheckOuts} departures today`
              : 'Confirmed + Checked In'
          }
          change={kpis ? `${kpis.pendingLeads} leads pending` : ''}
          trend="up"
          icon={<Calendar className="w-5 h-5 text-teal-700" />}
        />
      </div>

      {/* TODAY'S OPERATIONAL METRICS BAR */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Today's Live Operations • {todayShort}
            </h3>
          </div>
          <span className="text-xs text-teal-300 font-mono flex items-center gap-1">
            {kpisLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            Real-time sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center divide-x-0 sm:divide-x divide-slate-700/60">
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Arrivals</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5 font-tabular">
              {kpis ? kpis.todayCheckIns : todayArrivals.length}
            </p>
            <span className="text-[10px] text-slate-400">Expected check-ins</span>
          </div>
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Departures</p>
            <p className="text-2xl font-bold text-sky-400 mt-0.5 font-tabular">
              {kpis ? kpis.todayCheckOuts : todayDepartures.length}
            </p>
            <span className="text-[10px] text-slate-400">Checkouts today</span>
          </div>
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">In-House Guests</p>
            <p className="text-2xl font-bold text-white mt-0.5 font-tabular">
              {kpis ? kpis.occupiedUnits : '—'}
            </p>
            <span className="text-[10px] text-slate-400">Occupied units</span>
          </div>
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Follow-ups Today</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5 font-tabular">
              {followUpsDueToday.length}
            </p>
            <span className="text-[10px] text-slate-400">Due / overdue</span>
          </div>
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Open Tasks</p>
            <p className="text-2xl font-bold text-rose-400 mt-0.5 font-tabular">
              {kpis ? kpis.openTasks + kpis.openMaintenance : '—'}
            </p>
            <span className="text-[10px] text-rose-300 font-semibold">
              {kpis ? `${kpis.openMaintenance} maintenance` : 'Tasks + maintenance'}
            </span>
          </div>
        </div>
      </div>

      {/* REVENUE BY PROPERTY BREAKDOWN */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue Performance by Property</h3>
            <p className="text-xs text-slate-500">
              Gross accommodation payments — {currentMonthLabel}
            </p>
          </div>
          {kpis && (
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
              {formatINR(kpis.revenueThisMonth)} Gross
            </span>
          )}
          {kpisLoading && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading…
            </span>
          )}
        </div>

        <div className="space-y-3">
          {propertyRevenue.length > 0 ? (
            propertyRevenue
              .sort((a, b) => b.revenue - a.revenue)
              .map((item) => (
                <div key={item.propertyId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800">{item.propertyName}</span>
                    <span className="font-bold text-slate-900 font-tabular">
                      {formatINR(item.revenue)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((item.revenue / maxRevenue) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              {kpisLoading
                ? 'Loading revenue data…'
                : 'No revenue data yet. Seed the demo portfolio or record payments to see data here.'}
            </div>
          )}
        </div>
      </div>

      {/* TODAY'S ARRIVALS & DEPARTURES TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Today's Arrivals</h3>
                <Badge variant="success" size="xs">
                  {kpis ? kpis.todayCheckIns : todayArrivals.length}
                </Badge>
              </div>
              <span className="text-xs text-slate-400">Expected Check-ins</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Guest</th>
                    <th className="pb-2">Property &amp; Room</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayArrivals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 text-[11px]">
                        No arrivals scheduled for today
                      </td>
                    </tr>
                  ) : (
                    todayArrivals.slice(0, 5).map((arr) => (
                      <tr key={arr.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 pr-2">
                          <p className="font-semibold text-slate-900">{arr.guestName}</p>
                          <p className="text-[11px] text-slate-500">{arr.guestsCount} Guests</p>
                        </td>
                        <td className="py-2.5 pr-2">
                          <p className="font-medium text-slate-800">{arr.propertyName}</p>
                          <p className="text-[11px] text-teal-600 font-semibold">{arr.unitNumber}</p>
                        </td>
                        <td className="py-2.5 pr-2">
                          <Badge status={arr.status} size="xs">
                            {arr.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right space-x-1 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openDrawer('reservation', arr.id)}
                          >
                            View
                          </Button>
                          {arr.status === 'Confirmed' && (
                            <Button
                              variant="success"
                              size="xs"
                              onClick={() => checkInGuest(arr.id)}
                            >
                              Check In
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Departures Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Today's Departures</h3>
                <Badge variant="info" size="xs">
                  {kpis ? kpis.todayCheckOuts : todayDepartures.length}
                </Badge>
              </div>
              <span className="text-xs text-slate-400">Checkout &amp; Balance</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Guest</th>
                    <th className="pb-2">Room</th>
                    <th className="pb-2">Balance</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayDepartures.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 text-[11px]">
                        No departures scheduled for today
                      </td>
                    </tr>
                  ) : (
                    todayDepartures.slice(0, 5).map((dep) => (
                      <tr key={dep.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 pr-2">
                          <p className="font-semibold text-slate-900">{dep.guestName}</p>
                          <p className="text-[11px] text-slate-500">{dep.propertyName}</p>
                        </td>
                        <td className="py-2.5 pr-2">
                          <span className="font-semibold text-slate-800">{dep.unitNumber}</span>
                        </td>
                        <td className="py-2.5 pr-2 font-tabular font-semibold">
                          {dep.balance > 0 ? (
                            <span className="text-rose-600">₹{dep.balance.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-emerald-600">Paid (₹0)</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right space-x-1 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openDrawer('reservation', dep.id)}
                          >
                            View
                          </Button>
                          {dep.status !== 'Checked Out' && (
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => checkOutGuest(dep.id)}
                            >
                              Check Out
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FOLLOW-UPS DUE TODAY TABLE */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">CRM Follow-ups Due Today</h3>
              <Badge variant="danger" size="xs">
                {followUpsDueToday.length} Pending
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Direct guest phone &amp; WhatsApp follow-ups to close pipeline bookings
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => openGlobalModal('new-followup')}
          >
            + New Follow-up
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2">Time</th>
                <th className="pb-2">Guest &amp; Phone</th>
                <th className="pb-2">Property</th>
                <th className="pb-2">Purpose</th>
                <th className="pb-2">Assigned</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {followUpsDueToday.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-[11px]">
                    No follow-ups due today — great work! 🎉
                  </td>
                </tr>
              ) : (
                followUpsDueToday.slice(0, 5).map((fu) => (
                  <tr key={fu.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pr-2 font-mono font-semibold text-slate-700">
                      {fu.scheduledTime}
                    </td>
                    <td className="py-3 pr-2">
                      <p className="font-semibold text-slate-900">{fu.guestName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{fu.guestPhone}</p>
                    </td>
                    <td className="py-3 pr-2 text-slate-700 font-medium">{fu.propertyName}</td>
                    <td className="py-3 pr-2 text-slate-600 max-w-xs truncate">{fu.purpose}</td>
                    <td className="py-3 pr-2 text-slate-700">{fu.assignedTo}</td>
                    <td className="py-3 pr-2">
                      <Badge status={fu.status} size="xs">
                        {fu.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap space-x-1.5">
                      <Button
                        variant="outline"
                        size="xs"
                        icon={<Phone className="w-3 h-3 text-teal-600" />}
                        onClick={() => showToast('Simulating call...', `Dialing ${fu.guestPhone}`)}
                      >
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        icon={<MessageSquare className="w-3 h-3 text-emerald-600" />}
                        onClick={() =>
                          showToast('Simulating WhatsApp...', `Opening WhatsApp for ${fu.guestPhone}`)
                        }
                      >
                        WhatsApp
                      </Button>
                      {fu.status !== 'Completed' && (
                        <Button
                          variant="success"
                          size="xs"
                          onClick={() => openGlobalModal('complete-followup', fu)}
                        >
                          Complete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
