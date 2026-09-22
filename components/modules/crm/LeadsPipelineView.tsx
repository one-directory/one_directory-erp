'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Lead, LeadStatus } from '@/types/erp';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Phone,
  MessageSquare,
  Calendar,
  DollarSign,
  User,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

export function LeadsPipelineView() {
  const { leads, updateLeadStatus, openDrawer, openGlobalModal, selectedPropertyId } = useERP();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const filteredLeads = leads.filter(
    (l) => selectedPropertyId === 'all' || l.propertyId === selectedPropertyId
  );

  const stages: { key: LeadStatus; label: string; color: string }[] = [
    { key: 'New', label: 'New Enquiries', color: 'border-slate-300' },
    { key: 'Contacted', label: 'Contacted', color: 'border-sky-300' },
    { key: 'Interested', label: 'Interested', color: 'border-teal-300' },
    { key: 'Quotation Sent', label: 'Quotation Sent', color: 'border-amber-300' },
    { key: 'Follow-up', label: 'Follow-up', color: 'border-indigo-300' },
    { key: 'Confirmed', label: 'Confirmed Booking', color: 'border-emerald-400' },
    { key: 'Not Interested', label: 'Not Interested', color: 'border-slate-200' },
    { key: 'Lost', label: 'Lost / Expired', color: 'border-rose-300' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Leads Pipeline</h1>
            <Badge variant="info" size="xs">
              {filteredLeads.length} Active Leads
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual enquiry-to-booking pipeline with revenue tracking and stage transitions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Kanban / Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openGlobalModal('new-lead')}
          >
            + New Lead
          </Button>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Kanban className="w-6 h-6" />}
          title="No leads in pipeline"
          description="Capture new guest inquiries and track them from first contact through confirmed booking."
          actionLabel="+ New Lead"
          onAction={() => openGlobalModal('new-lead')}
        />
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.key);
            const stageTotal = stageLeads.reduce((acc, l) => acc + l.estimatedValue, 0);

            return (
              <div
                key={stage.key}
                className="w-72 shrink-0 flex flex-col bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{stage.label}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-semibold">
                        {stageLeads.length}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-tabular font-medium mt-0.5">
                      ₹{(stageTotal / 1000).toFixed(0)}k pipeline
                    </p>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400 border border-dashed border-slate-300 rounded-xl">
                      No leads
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => openDrawer('lead', lead.id)}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-400 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-mono text-teal-700 font-semibold">
                            {lead.leadNumber}
                          </span>
                          <span className="text-[10px] font-bold text-slate-900 font-tabular">
                            ₹{lead.estimatedValue.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{lead.guestName}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{lead.propertyName}</p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <span>{lead.checkIn} ({lead.guestsCount} pax)</span>
                          <span className="text-slate-700 font-medium">{lead.assignedTo}</span>
                        </div>

                        {/* Quick stage transition button */}
                        <div
                          className="pt-1 flex items-center justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none"
                          >
                            <option value="New">Move: New</option>
                            <option value="Contacted">Move: Contacted</option>
                            <option value="Interested">Move: Interested</option>
                            <option value="Quotation Sent">Move: Quotation Sent</option>
                            <option value="Follow-up">Move: Follow-up</option>
                            <option value="Confirmed">Move: Confirmed</option>
                            <option value="Not Interested">Move: Not Interested</option>
                            <option value="Lost">Move: Lost</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Lead ID & Guest</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Dates & Guests</th>
                <th className="py-3 px-4">Est. Value</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{l.guestName}</p>
                    <p className="text-[10px] text-teal-700 font-mono">{l.leadNumber}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{l.propertyName}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {l.checkIn} → {l.checkOut} ({l.guestsCount} pax)
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 font-tabular">
                    ₹{l.estimatedValue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{l.source}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{l.assignedTo}</td>
                  <td className="py-3 px-4">
                    <Badge status={l.status} size="xs">
                      {l.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => openDrawer('lead', l.id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
