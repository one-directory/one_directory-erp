'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Wrench, Plus, CheckCircle, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

export function MaintenanceView() {
  const {
    maintenanceTickets,
    selectedPropertyId,
    resolveMaintenanceTicket,
    openDrawer,
    openGlobalModal,
  } = useERP();

  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = maintenanceTickets.filter((t) => {
    if (selectedPropertyId !== 'all' && t.propertyId !== selectedPropertyId) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Maintenance & Facility Repairs</h1>
            <Badge variant="danger" size="xs">
              {filtered.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length} Open Tickets
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Plumbing, HVAC, electrical, and structural repair tickets with automatic unit availability holds
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openGlobalModal('maintenance-ticket')}
        >
          + Log Maintenance Ticket
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-6 h-6" />}
          title="No maintenance tickets"
          description="All units are operational and in service with zero pending repair tickets."
          actionLabel="+ Log Maintenance Ticket"
          onAction={() => openGlobalModal('maintenance-ticket')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-3 px-4">Ticket ID</th>
              <th className="py-3 px-4">Property & Room</th>
              <th className="py-3 px-4">Reported Issue</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assigned Technician</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.ticketNumber}</td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-800">{t.propertyName}</p>
                  <p className="text-[11px] font-mono text-teal-700">{t.unitNumber}</p>
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <p className="font-semibold text-slate-900">{t.issue}</p>
                  <p className="text-[11px] text-slate-500 truncate">{t.description}</p>
                </td>
                <td className="py-3.5 px-4">
                  <Badge status={t.priority} size="xs">
                    {t.priority}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-slate-700 font-medium">{t.assignedTo}</td>
                <td className="py-3.5 px-4 text-slate-500 text-[11px]">{t.createdAt}</td>
                <td className="py-3.5 px-4">
                  <Badge status={t.status} size="xs">
                    {t.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => openDrawer('maintenance', t.id)}
                  >
                    View
                  </Button>
                  {t.status !== 'Resolved' && t.status !== 'Closed' && (
                    <Button
                      variant="success"
                      size="xs"
                      onClick={() => resolveMaintenanceTicket(t.id)}
                    >
                      Resolve (Free Unit)
                    </Button>
                  )}
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
