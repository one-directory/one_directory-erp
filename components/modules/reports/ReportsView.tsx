'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

export function ReportsView() {
  const { properties, reservations, leads, followUps, selectedPropertyId } = useERP();

  const [activeTab, setActiveTab] = useState('revenue');

  // Filter properties
  const filteredProps = properties.filter(
    (p) => selectedPropertyId === 'all' || p.id === selectedPropertyId
  );

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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Month Revenue</th>
                  <th className="py-3 px-4">Total Bookings</th>
                  <th className="py-3 px-4">Avg Booking Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProps.map((p) => {
                  const bCount = Math.floor(p.revenueThisMonth / 9200);
                  const abv = Math.floor(p.revenueThisMonth / (bCount || 1));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.type}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{p.totalUnits}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-tabular text-sm">
                        ₹{p.revenueThisMonth.toLocaleString('en-IN')}
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
        </div>
      )}

      {/* OCCUPANCY REPORT */}
      {activeTab === 'occupancy' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Available Nights (Sep)</th>
                <th className="py-3 px-4">Occupied Nights</th>
                <th className="py-3 px-4">Occupancy %</th>
                <th className="py-3 px-4">Visual Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProps.map((p) => {
                const totalNights = p.totalUnits * 30;
                const occupiedNights = Math.round((totalNights * p.occupancyRate) / 100);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4 font-tabular text-slate-600">{totalNights}</td>
                    <td className="py-3.5 px-4 font-tabular text-slate-900 font-semibold">
                      {occupiedNights}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-teal-700 font-tabular text-sm">
                      {p.occupancyRate}%
                    </td>
                    <td className="py-3.5 px-4 w-48">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${p.occupancyRate}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CRM CONVERSION FUNNEL REPORT */}
      {activeTab === 'crm' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">CRM Conversion Metrics</h3>
            <p className="text-xs text-slate-500">
              Objective funnel counts and percentage conversions from enquiry to confirmed booking
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Enquiries</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">104</p>
              <span className="text-[11px] text-slate-400">100% Inbound</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Quotations Sent</span>
              <p className="text-2xl font-bold text-teal-700 mt-1">62</p>
              <span className="text-[11px] text-teal-600 font-semibold">59.6% Quote Rate</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Confirmed Bookings</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">38</p>
              <span className="text-[11px] text-emerald-600 font-semibold">36.5% Overall Win</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Lost / No Response</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">26</p>
              <span className="text-[11px] text-slate-400">25.0% Loss Ratio</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
