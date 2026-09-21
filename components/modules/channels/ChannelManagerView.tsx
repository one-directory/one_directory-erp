'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { OTAChannel, ChannelConnection, ChannelSyncEventType } from '@/types/erp';
import {
  Globe,
  RefreshCw,
  Sparkles,
  Sliders,
  Calendar,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronRight,
  Download,
  Percent,
  XCircle,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const CHANNEL_LOGOS: Record<
  OTAChannel,
  {
    name: string;
    badgeClass: string;
    borderClass: string;
    bgHover: string;
    lightBg: string;
    textColor: string;
    initials: string;
    description: string;
  }
> = {
  Airbnb: {
    name: 'Airbnb',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    borderClass: 'border-rose-200 hover:border-rose-300',
    bgHover: 'hover:bg-rose-50/40',
    lightBg: 'bg-rose-50',
    textColor: 'text-rose-600',
    initials: 'ABNB',
    description: 'Direct API v2 Host Connectivity with instant messaging & iCal sync',
  },
  'Booking.com': {
    name: 'Booking.com',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    borderClass: 'border-blue-200 hover:border-blue-300',
    bgHover: 'hover:bg-blue-50/40',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
    initials: 'BDC',
    description: 'Supply-XML Availability & Content distribution engine',
  },
  Agoda: {
    name: 'Agoda',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    borderClass: 'border-amber-200 hover:border-amber-300',
    bgHover: 'hover:bg-amber-50/40',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-600',
    initials: 'AGD',
    description: 'YCS Partner Extranet rate push with automated min-stay parity',
  },
  MakeMyTrip: {
    name: 'MakeMyTrip',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderClass: 'border-emerald-200 hover:border-emerald-300',
    bgHover: 'hover:bg-emerald-50/40',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    initials: 'MMT',
    description: 'InGoMMT Domestic India connectivity with GST compliance rules',
  },
};

export function ChannelManagerView() {
  const {
    channelConnections,
    channelSyncEvents,
    channelRateRules,
    isSyncingChannels,
    triggerGlobalChannelSync,
    openGlobalModal,
    simulateIncomingOtaBooking,
    simulateOtaCancellation,
    updateChannelRateMarkup,
    updateChannelSettings,
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    reservations,
    showToast,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'simulator' | 'parity' | 'ical' | 'logs'>('simulator');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [copiedFeedId, setCopiedFeedId] = useState<string | null>(null);
  const [inspectPayload, setInspectPayload] = useState<any | null>(null);

  // Filter connections by selected property if not 'all'
  const visibleConnections = channelConnections;

  const handleCopyFeed = (channel: OTAChannel, exportUrl: string) => {
    const fullUrl = `${window.location.origin}${exportUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedFeedId(channel);
    showToast('Feed URL Copied', `${channel} iCal feed copied to clipboard`);
    setTimeout(() => setCopiedFeedId(null), 3000);
  };

  // Recent OTA reservations for cancellation testing
  const otaReservations = reservations.filter(
    (r) =>
      ['Airbnb', 'Booking.com', 'Agoda', 'MakeMyTrip'].includes(r.source) &&
      r.status !== 'Cancelled'
  );

  const filteredLogs = channelSyncEvents.filter(
    (e) => selectedChannelFilter === 'all' || e.channel === selectedChannelFilter
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/70">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              OTA Channel Manager & Sync Simulator
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Two-way inventory distribution, rate parity matrix, and calendar synchronization across{' '}
            <strong className="text-slate-700">Airbnb</strong>,{' '}
            <strong className="text-slate-700">Booking.com</strong>,{' '}
            <strong className="text-slate-700">Agoda</strong>, and{' '}
            <strong className="text-slate-700">MakeMyTrip</strong>.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerGlobalChannelSync}
            disabled={isSyncingChannels}
            icon={
              <RefreshCw className={`w-4 h-4 text-teal-600 ${isSyncingChannels ? 'animate-spin' : ''}`} />
            }
          >
            {isSyncingChannels ? 'Syncing All OTAs...' : 'Sync All Channels Now'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openGlobalModal('simulate-ota-booking')}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Simulate Booking
          </Button>
        </div>
      </div>

      {/* Connectivity & Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleConnections.map((conn) => {
          const info = CHANNEL_LOGOS[conn.channel];
          return (
            <div
              key={conn.id}
              className={`bg-white rounded-2xl border p-4.5 shadow-xs transition-all relative overflow-hidden ${info.borderClass}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${info.badgeClass}`}>
                    {info.initials}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{conn.channel}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{conn.syncMode}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {conn.status}
                </span>
              </div>

              <div className="space-y-1.5 py-2 border-y border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>OTA Commission:</span>
                  <span className="font-semibold text-rose-600">{conn.commissionRate}% fee</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Channel Markup:</span>
                  <span className="font-semibold text-emerald-600">+{conn.rateMarkupPercentage}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Active Listings:</span>
                  <span className="font-semibold text-slate-700">{conn.activeListingsCount} Units</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Synced {conn.lastSyncAt}
                </span>
                <button
                  onClick={() => handleCopyFeed(conn.channel, conn.iCalExportUrl)}
                  className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-0.5 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>iCal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex space-x-2">
          {[
            { id: 'simulator', label: 'Live Booking Simulator', icon: Sparkles },
            { id: 'parity', label: 'Rate Parity & Markup Matrix', icon: Percent },
            { id: 'ical', label: 'Two-Way iCal Feeds', icon: Calendar },
            { id: 'logs', label: 'Sync Audit Log', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-teal-600 text-teal-700 bg-teal-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: LIVE SIMULATOR & WEBHOOK INJECTOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Quick 1-Click Simulated Booking Ingestion */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Instant OTA Booking Triggers (1-Click Test)</h3>
                <p className="text-xs text-slate-500">
                  Simulate receiving webhook reservations from OTAs. Watch room assignment, financial calculation, and automatic calendar blocks on the other 3 channels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['MakeMyTrip', 'Airbnb', 'Booking.com', 'Agoda'] as OTAChannel[]).map((c) => {
                const info = CHANNEL_LOGOS[c];
                return (
                  <button
                    key={c}
                    onClick={() =>
                      simulateIncomingOtaBooking({
                        channel: c,
                        nights: c === 'Airbnb' ? 3 : 2,
                        baseRate: c === 'MakeMyTrip' ? 4500 : c === 'Airbnb' ? 5200 : 4800,
                      })
                    }
                    className={`p-4 rounded-xl border text-left transition-all group cursor-pointer bg-slate-50/50 hover:bg-white hover:shadow-md ${info.borderClass}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${info.badgeClass}`}>
                        {info.initials}
                      </span>
                      <Zap className={`w-4 h-4 ${info.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    <p className="font-bold text-xs text-slate-900 leading-tight">
                      Simulate {c} Booking
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Trigger instant webhook & calendar block
                    </p>
                    <div className="mt-3 text-[10px] font-semibold text-teal-600 flex items-center gap-1">
                      <span>Test Inject</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cancellation Simulator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">OTA Cancellation & Room Release Simulator</h3>
                <p className="text-xs text-slate-500">
                  Simulate guest cancellations on OTAs. Verifies that room inventory is instantly released and unblocked across all channels.
                </p>
              </div>
              <Badge variant="neutral" size="xs">
                {otaReservations.length} Active OTA Bookings
              </Badge>
            </div>

            {otaReservations.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400">
                No active OTA reservations yet. Click one of the buttons above to inject an instant booking!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-200">
                  <thead className="bg-slate-50/70 text-slate-400 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">OTA Channel</th>
                      <th className="py-2.5 px-3">Booking ID</th>
                      <th className="py-2.5 px-3">Guest</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Dates</th>
                      <th className="py-2.5 px-3">Gross Amount</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {otaReservations.slice(0, 5).map((r) => {
                      const info = CHANNEL_LOGOS[r.source as OTAChannel] || CHANNEL_LOGOS.Airbnb;
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${info.badgeClass}`}>
                              {r.source}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                            {r.bookingId}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{r.guestName}</td>
                          <td className="py-2.5 px-3 font-semibold text-teal-700">{r.unitNumber}</td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {r.checkIn} → {r.checkOut}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            ₹{r.total?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => simulateOtaCancellation(r.id)}
                            >
                              Simulate Cancel
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RATE PARITY & MARKUP MATRIX */}
      {activeTab === 'parity' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Channel Rate Parity & Commission Multipliers</h3>
                <p className="text-xs text-slate-500 max-w-xl">
                  Hospitality operators apply channel-specific markups to absorb OTA commissions. Adjust the markup sliders below to update calculated channel prices in real-time.
                </p>
              </div>

              {/* Commission Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
                  Airbnb: 15% Comm.
                </span>
                <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold">
                  Booking.com: 18% Comm.
                </span>
                <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold">
                  Agoda: 17% Comm.
                </span>
                <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                  MakeMyTrip: 20% Comm.
                </span>
              </div>
            </div>

            {/* Quick Multiplier Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl mb-6">
              {(['Airbnb', 'Booking.com', 'Agoda', 'MakeMyTrip'] as OTAChannel[]).map((c) => {
                const conn = channelConnections.find((conn) => conn.channel === c);
                const currentMarkup = conn?.rateMarkupPercentage || 12;
                return (
                  <div key={c} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{c} Markup:</span>
                      <span className="font-extrabold text-teal-700">+{currentMarkup}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={currentMarkup}
                      onChange={(e) => updateChannelRateMarkup(c, Number(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0% (Direct parity)</span>
                      <span>+30%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-3">Property & Room Type</th>
                    <th className="py-3 px-3">Base Rate (Direct)</th>
                    <th className="py-3 px-3 text-rose-700">Airbnb Rate (Net)</th>
                    <th className="py-3 px-3 text-blue-700">Booking.com Rate (Net)</th>
                    <th className="py-3 px-3 text-amber-700">Agoda Rate (Net)</th>
                    <th className="py-3 px-3 text-emerald-700">MakeMyTrip Rate (Net)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {channelRateRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{rule.unitTypeName}</p>
                        <p className="text-[11px] text-slate-400">{rule.propertyName}</p>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        ₹{rule.baseRate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">
                          ₹{rule.rates.Airbnb.channelRate.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          Net: ₹{rule.rates.Airbnb.netPayout.toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">
                          ₹{rule.rates['Booking.com'].channelRate.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          Net: ₹{rule.rates['Booking.com'].netPayout.toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">
                          ₹{rule.rates.Agoda.channelRate.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          Net: ₹{rule.rates.Agoda.netPayout.toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">
                          ₹{rule.rates.MakeMyTrip.channelRate.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          Net: ₹{rule.rates.MakeMyTrip.netPayout.toLocaleString('en-IN')}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TWO-WAY iCAL FEEDS */}
      {activeTab === 'ical' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live RFC 5545 iCalendar (.ics) Calendar Subscriptions</h3>
              <p className="text-xs text-slate-500">
                Subscribe to these live calendar export links on your Airbnb, Booking.com, Agoda, or InGoMMT extranet calendars to sync blocked dates automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {channelConnections.map((conn) => {
                const info = CHANNEL_LOGOS[conn.channel];
                const isCopied = copiedFeedId === conn.channel;
                return (
                  <div
                    key={conn.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${info.badgeClass}`}>
                          {conn.channel}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{conn.propertyName}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono break-all">
                        {conn.iCalExportUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleCopyFeed(conn.channel, conn.iCalExportUrl)}
                        icon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      >
                        {isCopied ? 'Copied' : 'Copy Feed URL'}
                      </Button>
                      <a
                        href={conn.iCalExportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .ics</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYNC AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Real-Time Channel Activity & Webhook Exchange Log</h3>
                <p className="text-xs text-slate-500">Live feed of inbound and outbound API payloads, stop-sell signals, and latency benchmarks.</p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter:</span>
                <select
                  value={selectedChannelFilter}
                  onChange={(e) => setSelectedChannelFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="all">All Channels</option>
                  <option value="MakeMyTrip">MakeMyTrip</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Agoda">Agoda</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-200">
                <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Reference / Property</th>
                    <th className="py-2.5 px-3">Details</th>
                    <th className="py-2.5 px-3 text-right">Latency</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredLogs.map((log) => {
                    const info = CHANNEL_LOGOS[log.channel] || CHANNEL_LOGOS.Airbnb;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${info.badgeClass}`}>
                            {log.channel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {log.eventType.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{log.bookingReference || 'Global Sync'}</p>
                          <p className="text-[10px] text-slate-400">{log.propertyName}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-md">{log.details}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                          {log.latencyMs || 120}ms
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Badge variant="success" size="xs">
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
