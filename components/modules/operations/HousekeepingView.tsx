'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sparkles, CheckCircle2, Clock, Eye, Play, Plus, Check } from 'lucide-react';

export function HousekeepingView() {
  const {
    housekeepingTasks,
    selectedPropertyId,
    startHousekeepingTask,
    completeHousekeepingTask,
    inspectHousekeepingTask,
    openDrawer,
    openGlobalModal,
  } = useERP();

  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = housekeepingTasks.filter((t) => {
    if (selectedPropertyId !== 'all' && t.propertyId !== selectedPropertyId) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const countPending = housekeepingTasks.filter((t) => t.status === 'Pending').length;
  const countCleaning = housekeepingTasks.filter((t) => t.status === 'Cleaning').length;
  const countInspection = housekeepingTasks.filter((t) => t.status === 'Inspection').length;
  const countCompleted = housekeepingTasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Housekeeping Operations</h1>
            <Badge variant="warning" size="xs">
              {countPending + countCleaning} Incomplete
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Turnover sanitization, deep cleaning schedules, and room inspection approvals
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openGlobalModal('housekeeping-task')}
        >
          + Schedule Task
        </Button>
      </div>

      {/* Top 4 KPI Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'all' : 'Pending')}
          className={`p-4 bg-white rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Pending' ? 'border-amber-500 shadow-xs' : 'border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase">Pending</span>
          <p className="text-2xl font-bold text-amber-700 mt-1 font-tabular">{countPending}</p>
        </div>
        <div
          onClick={() => setStatusFilter(statusFilter === 'Cleaning' ? 'all' : 'Cleaning')}
          className={`p-4 bg-white rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Cleaning' ? 'border-teal-500 shadow-xs' : 'border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase">In Progress (Cleaning)</span>
          <p className="text-2xl font-bold text-teal-700 mt-1 font-tabular">{countCleaning}</p>
        </div>
        <div
          onClick={() => setStatusFilter(statusFilter === 'Inspection' ? 'all' : 'Inspection')}
          className={`p-4 bg-white rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Inspection' ? 'border-sky-500 shadow-xs' : 'border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase">Inspection</span>
          <p className="text-2xl font-bold text-sky-700 mt-1 font-tabular">{countInspection}</p>
        </div>
        <div
          onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'all' : 'Completed')}
          className={`p-4 bg-white rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Completed' ? 'border-emerald-500 shadow-xs' : 'border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase">Completed</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1 font-tabular">{countCompleted}</p>
        </div>
      </div>

      {/* Housekeeping Tasks Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-6 h-6" />}
          title="No housekeeping tasks"
          description="All units are pristine, or no cleaning tasks match the selected filter."
          actionLabel="+ Schedule Task"
          onAction={() => openGlobalModal('housekeeping-task')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-3 px-4">Property & Unit</th>
              <th className="py-3 px-4">Task Type</th>
              <th className="py-3 px-4">Assigned Attendant</th>
              <th className="py-3 px-4">Scheduled</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Workflow Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((hk) => (
              <tr key={hk.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  <span>{hk.propertyName}</span>
                  <span className="block text-[11px] font-mono text-teal-700">{hk.unitNumber}</span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{hk.taskType}</td>
                <td className="py-3.5 px-4 text-slate-700">{hk.assignedTo}</td>
                <td className="py-3.5 px-4 text-slate-600 font-mono">{hk.scheduledTime}</td>
                <td className="py-3.5 px-4">
                  <Badge status={hk.priority} size="xs">
                    {hk.priority}
                  </Badge>
                </td>
                <td className="py-3.5 px-4">
                  <Badge status={hk.status} size="xs">
                    {hk.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => openDrawer('housekeeping', hk.id)}
                  >
                    View
                  </Button>
                  {hk.status === 'Pending' && (
                    <Button
                      variant="outline"
                      size="xs"
                      icon={<Play className="w-3 h-3 text-teal-600" />}
                      onClick={() => startHousekeepingTask(hk.id)}
                    >
                      Start
                    </Button>
                  )}
                  {hk.status === 'Cleaning' && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => completeHousekeepingTask(hk.id)}
                    >
                      Complete
                    </Button>
                  )}
                  {hk.status === 'Inspection' && (
                    <Button
                      variant="success"
                      size="xs"
                      onClick={() => inspectHousekeepingTask(hk.id)}
                    >
                      Sign Off (Available)
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
