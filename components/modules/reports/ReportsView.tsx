'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  Percent,
} from 'lucide-react';

export function ReportsView() {
  const {
    properties,
    units,
    reservations,
    payments,
    leads,
    quotations,
    selectedPropertyId,
    openGlobalModal,
  } = useERP();

  const [activeTab, setActiveTab] = useState('revenue');

  // Filter scoped to selected property
  const filteredProps = properties.filter(
    (p) => selectedPropertyId === 'all' || p.id === selectedPropertyId
  );
  const filteredUnits = units.filter(
    (u) => selectedPropertyId === 'all' || u.propertyId === selectedPropertyId
  );
  const filteredReservations = reservations.filter(
    (r) => selectedPropertyId === 'all' || r.propertyId === selectedPropertyId
  );
  const filteredPayments = payments.filter(
    (p) => selectedPropertyId === 'all' || p.propertyId === selectedPropertyId
  );
  const filteredLeads = leads.filter(
    (l) => selectedPropertyId === 'all' || l.propertyId === selectedPropertyId
  );
  const filteredQuotes = quotations.filter(
    (q) => selectedPropertyId === 'all' || q.propertyId === selectedPropertyId
  );

  // Revenue metrics
  const totalRevenue = filteredPayments
    .filter((p) => p.status === 'Success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const confirmedBookingsList = filteredReservations.filter((r) =>
    ['Confirmed', 'Checked In', 'In House', 'Checked Out'].includes(r.status)
  );
  const totalConfirmedBookings = confirmedBookingsList.length;
  const avgBookingValue =
    totalConfirmedBookings > 0 ? Math.round(totalRevenue / totalConfirmedBookings) : 0;

  // Occupancy metrics
  const totalUnitCount = filteredUnits.length;
  const occupiedUnitCount = filteredUnits.filter((u) => u.status === 'Occupied').length;
  const availableUnitCount = filteredUnits.filter((u) => u.status === 'Available').length;
  const maintenanceUnitCount = filteredUnits.filter((u) =>
    ['Cleaning', 'Dirty', 'Maintenance', 'Inspection', 'Out of Service', 'Blocked'].includes(
      u.status
    )
  ).length;
  const overallOccupancyRate =
    totalUnitCount > 0 ? Math.round((occupiedUnitCount / totalUnitCount) * 100) : 0;

  // CRM Funnel metrics
  const totalEnquiries = filteredLeads.length;
  const quotationsSent = filteredQuotes.filter((q) => q.status !== 'Draft').length;
  const confirmedLeads = confirmedBookingsList.length;
  const lostLeads = filteredLeads.filter((l) =>
    ['Not Interested', 'No Response', 'Lost', 'Cancelled'].includes(l.status)
  ).length;

  const quoteRate =
    totalEnquiries > 0 ? ((quotationsSent / totalEnquiries) * 100).toFixed(1) : '0';
  const winRate =
    totalEnquiries > 0 ? ((confirmedLeads / totalEnquiries) * 100).toFixed(1) : '0';
  const lossRate =
    totalEnquiries > 0 ? ((lostLeads / totalEnquiries) * 100).toFixed(1) : '0';

  // CRM Lead Sources
  const leadSources = [
    'Phone Call',
    'WhatsApp',
    'Website',
    'Walk-in',
    'Referral',
    'Instagram',
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Objective portfolio revenue, room occupancy, channel metrics, and CRM pipeline conversions
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'revenue', label: 'Revenue Report' },
          { id: 'occupancy', label: 'Occupancy Analysis' },
          { id: 'crm', label: 'CRM Funnel Report' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* REVENUE REPORT */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          {filteredProps.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="w-6 h-6" />}
              title="No Property Revenue Found"
              description="Record reservation payments to generate portfolio revenue analytics and booking performance."
              actionLabel="+ Record Payment"
              onAction={() => openGlobalModal('record-payment')}
            />
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-tabular">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-teal-600 font-medium">Recorded Payments</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Confirmed Bookings
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-tabular">
                    {totalConfirmedBookings}
                  </p>
                  <span className="text-[11px] text-slate-400">Total volume</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Avg Booking Value
                  </span>
                  <p className="text-2xl font-bold text-teal-700 mt-1 font-tabular">
                    ₹{avgBookingValue.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-slate-400">Per confirmed reservation</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Properties
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-tabular">
                    {filteredProps.length}
                  </p>
                  <span className="text-[11px] text-slate-400">In current portfolio scope</span>
                </div>
              </div>

              {/* Property Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Units</th>
                      <th className="py-3 px-4">Total Revenue</th>
                      <th className="py-3 px-4">Total Bookings</th>
                      <th className="py-3 px-4">Avg Booking Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProps.map((p) => {
                      const propPayments = filteredPayments.filter(
                        (pm) => pm.propertyId === p.id && pm.status === 'Success'
                      );
                      const propRevenue = propPayments.reduce((sum, pm) => sum + (pm.amount || 0), 0);
                      const propReservations = filteredReservations.filter(
                        (r) =>
                          r.propertyId === p.id &&
                          ['Confirmed', 'Checked In', 'In House', 'Checked Out'].includes(r.status)
                      );
                      const bCount = propReservations.length;
                      const abv = bCount > 0 ? Math.round(propRevenue / bCount) : 0;
                      const propUnitsCount = units.filter((u) => u.propertyId === p.id).length || p.totalUnits;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                          <td className="py-3.5 px-4 text-slate-600">{p.type}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{propUnitsCount}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 font-tabular text-sm">
                            ₹{propRevenue.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">{bCount}</td>
                          <td className="py-3.5 px-4 font-tabular text-teal-800 font-semibold">
                            ₹{abv.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* OCCUPANCY REPORT */}
      {activeTab === 'occupancy' && (
        <div className="space-y-4">
          {filteredProps.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="w-6 h-6" />}
              title="No Properties Available"
              description="Create reservations and manage unit inventories to monitor occupancy levels and availability."
              actionLabel="+ New Reservation"
              onAction={() => openGlobalModal('new-reservation')}
            />
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Overall Occupancy
                  </span>
                  <p className="text-2xl font-bold text-teal-700 mt-1 font-tabular">
                    {overallOccupancyRate}%
                  </p>
                  <span className="text-[11px] text-slate-400">Current active rate</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Occupied Units
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-tabular">
                    {occupiedUnitCount} <span className="text-sm font-normal text-slate-400">/ {totalUnitCount}</span>
                  </p>
                  <span className="text-[11px] text-slate-400">Guests in-house</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Available Units
                  </span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1 font-tabular">
                    {availableUnitCount}
                  </p>
                  <span className="text-[11px] text-slate-400">Ready for check-in</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Turnover / Maint.
                  </span>
                  <p className="text-2xl font-bold text-amber-600 mt-1 font-tabular">
                    {maintenanceUnitCount}
                  </p>
                  <span className="text-[11px] text-slate-400">Cleaning or service</span>
                </div>
              </div>

              {/* Occupancy Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Total Units</th>
                      <th className="py-3 px-4">Occupied</th>
                      <th className="py-3 px-4">Available</th>
                      <th className="py-3 px-4">Occupancy %</th>
                      <th className="py-3 px-4">Occupancy Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProps.map((p) => {
                      const propUnits = units.filter((u) => u.propertyId === p.id);
                      const propTotalUnits = propUnits.length || p.totalUnits;
                      const propOccupied = propUnits.filter((u) => u.status === 'Occupied').length;
                      const propAvailable = propUnits.filter((u) => u.status === 'Available').length;
                      const propRate =
                        propTotalUnits > 0 ? Math.round((propOccupied / propTotalUnits) * 100) : 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                          <td className="py-3.5 px-4 font-tabular text-slate-600">{propTotalUnits}</td>
                          <td className="py-3.5 px-4 font-tabular text-slate-900 font-semibold">
                            {propOccupied}
                          </td>
                          <td className="py-3.5 px-4 font-tabular text-emerald-600 font-semibold">
                            {propAvailable}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-teal-700 font-tabular text-sm">
                            {propRate}%
                          </td>
                          <td className="py-3.5 px-4 w-48">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-600 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, propRate)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* CRM CONVERSION FUNNEL REPORT */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          {totalEnquiries === 0 && quotationsSent === 0 && confirmedLeads === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No CRM Pipeline Data"
              description="Capture leads and send quotations to view live conversion ratios and sales velocity."
              actionLabel="+ New Lead"
              onAction={() => openGlobalModal('new-lead')}
            />
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">CRM Conversion Metrics</h3>
                <p className="text-xs text-slate-500">
                  Live funnel counts and percentage conversions from enquiry to confirmed booking
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Enquiries
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-tabular">{totalEnquiries}</p>
                  <span className="text-[11px] text-slate-400">100% Inbound</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quotations Sent
                  </span>
                  <p className="text-2xl font-bold text-teal-700 mt-1 font-tabular">{quotationsSent}</p>
                  <span className="text-[11px] text-teal-600 font-semibold">{quoteRate}% Quote Rate</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Confirmed Bookings
                  </span>
                  <p className="text-2xl font-bold text-emerald-700 mt-1 font-tabular">
                    {confirmedLeads}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold">{winRate}% Overall Win</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Lost / No Response
                  </span>
                  <p className="text-2xl font-bold text-rose-600 mt-1 font-tabular">{lostLeads}</p>
                  <span className="text-[11px] text-slate-400">{lossRate}% Loss Ratio</span>
                </div>
              </div>

              {/* Source Breakdown */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Lead Volume by Source
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {leadSources.map((source) => {
                    const count = filteredLeads.filter((l) => l.source === source).length;
                    const percent =
                      totalEnquiries > 0 ? Math.round((count / totalEnquiries) * 100) : 0;
                    return (
                      <div
                        key={source}
                        className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-center"
                      >
                        <p className="text-xs font-semibold text-slate-600 truncate">{source}</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">{count}</p>
                        <span className="text-[10px] text-slate-400">{percent}% of leads</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
