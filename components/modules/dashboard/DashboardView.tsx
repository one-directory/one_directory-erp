'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  TrendingUp,
  CreditCard,
  Calendar,
  PhoneCall,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  MessageSquare,
  CheckCircle,
  Eye,
  LogOut,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export function DashboardView() {
  const {
    properties,
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

  // Filter reservations & follow-ups by global property if selected
  const filteredReservations = reservations.filter(
    (r) => selectedPropertyId === 'all' || r.propertyId === selectedPropertyId
  );
  const filteredFollowUps = followUps.filter(
    (f) => selectedPropertyId === 'all' || f.propertyId === selectedPropertyId
  );

  // Today is 19 September 2026
  const todayArrivals = filteredReservations.filter(
    (r) => r.checkIn === '2026-09-19' || r.status === 'Confirmed'
  );
  const todayDepartures = filteredReservations.filter(
    (r) => r.checkOut === '2026-09-19' || r.status === 'Checked In'
  );
  const followUpsDueToday = filteredFollowUps.filter(
    (f) => f.urgency === 'Due Today' || f.urgency === 'Overdue'
  );

  const [dateRange, setDateRange] = useState('Today');

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
            <span>Date: <strong>19 September 2026</strong></span>
            <span>•</span>
            <span>
              Scope:{' '}
              <strong className="text-teal-700">
                {selectedProperty ? selectedProperty.name : 'All Properties (7 Active)'}
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
          value={selectedProperty ? '1 Selected' : '24 Managed'}
          subtitle={selectedProperty ? selectedProperty.type : '7 Active Resorts/Homestays'}
          change="+2 this quarter"
          trend="up"
          icon={<Building2 className="w-5 h-5 text-teal-700" />}
        />
        <StatCard
          title="Average Occupancy"
          value={selectedProperty ? `${selectedProperty.occupancyRate}%` : '72.4%'}
          subtitle="Across 36 Room Units"
          change="+4.8% vs last month"
          trend="up"
          icon={<TrendingUp className="w-5 h-5 text-teal-700" />}
        />
        <StatCard
          title="Revenue This Month"
          value={
            selectedProperty
              ? `₹${(selectedProperty.revenueThisMonth / 100000).toFixed(2)}L`
              : '₹8.42L'
          }
          subtitle="Target: ₹10.0L"
          change="+12.5% vs target"
          trend="up"
          icon={<CreditCard className="w-5 h-5 text-teal-700" />}
        />
        <StatCard
          title="Active Bookings"
          value={filteredReservations.length.toString()}
          subtitle="18 Arrivals Today"
          change="+14 new this week"
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
              Today's Live Operations • 19 Sep 2026
            </h3>
          </div>
          <span className="text-xs text-teal-300 font-mono">Real-time sync</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center divide-x-0 sm:divide-x divide-slate-700/60">
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Arrivals</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5 font-tabular">18</p>
            <span className="text-[10px] text-slate-400">7 pending check-in</span>
          </div>
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Departures</p>
            <p className="text-2xl font-bold text-sky-400 mt-0.5 font-tabular">14</p>
            <span className="text-[10px] text-slate-400">4 checked out</span>
          </div>
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">In-House Guests</p>
            <p className="text-2xl font-bold text-white mt-0.5 font-tabular">132</p>
            <span className="text-[10px] text-slate-400">Across 24 units</span>
          </div>
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Follow-ups Today</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5 font-tabular">18</p>
            <span className="text-[10px] text-slate-400">Calls scheduled</span>
          </div>
          <div className="p-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Overdue Calls</p>
            <p className="text-2xl font-bold text-rose-400 mt-0.5 font-tabular">4</p>
            <span className="text-[10px] text-rose-300 font-semibold">Immediate action</span>
          </div>
        </div>
      </div>

      {/* REVENUE BY PROPERTY BREAKDOWN */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue Performance by Property</h3>
            <p className="text-xs text-slate-500">Total gross accommodation billings for September 2026</p>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
            ₹8,42,000 Gross
          </span>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Gayatri Nest', type: 'Homestay', rev: 182000, pct: 100 },
            { name: 'Silver Sands Beach Resort', type: 'Resort', rev: 145000, pct: 80 },
            { name: 'Ivory by Shore', type: 'Homestay', rev: 121000, pct: 66 },
            { name: 'Sattva Camps & Cottages', type: 'Camp / Cottages', rev: 114000, pct: 63 },
            { name: 'Delta Inn', type: 'Resort / Stay', rev: 98000, pct: 54 },
            { name: 'Tropical Bay Riverside Stay', type: 'Riverside Stay', rev: 95000, pct: 52 },
            { name: 'Vistara Beach Resort', type: 'Beach Resort', rev: 87000, pct: 48 },
          ].map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-800">
                  {item.name} <span className="text-[11px] text-slate-400">({item.type})</span>
                </span>
                <span className="font-bold text-slate-900 font-tabular">
                  ₹{item.rev.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
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
                  {todayArrivals.length}
                </Badge>
              </div>
              <span className="text-xs text-slate-400">Expected Check-ins</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Guest</th>
                    <th className="pb-2">Property & Room</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayArrivals.slice(0, 4).map((arr) => (
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
                  ))}
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
                  {todayDepartures.length}
                </Badge>
              </div>
              <span className="text-xs text-slate-400">Checkout & Balance</span>
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
                  {todayDepartures.slice(0, 4).map((dep) => (
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
                  ))}
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
              Direct guest phone & WhatsApp follow-ups to close pipeline bookings
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
                <th className="pb-2">Guest & Phone</th>
                <th className="pb-2">Property</th>
                <th className="pb-2">Purpose</th>
                <th className="pb-2">Assigned</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {followUpsDueToday.slice(0, 5).map((fu) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
